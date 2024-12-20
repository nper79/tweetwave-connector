import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols = [] } = await req.json();
    console.log('Fetching prices for symbols:', symbols);

    if (!symbols || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No symbols provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Try Binance first
    const binanceResponse = await fetch('https://api.binance.com/api/v3/ticker/price');
    if (!binanceResponse.ok) {
      throw new Error(`Binance API error: ${binanceResponse.statusText}`);
    }

    const binancePrices = await binanceResponse.json();
    console.log('Successfully fetched Binance prices');

    // Create Supabase client for storing prices
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const timestamp = new Date().toISOString();
    const prices = [];

    for (const symbol of symbols) {
      console.log(`Processing ${symbol}...`);
      
      // Try to find price on Binance
      const searchSymbol = `${symbol}USDT`;
      const binancePrice = binancePrices.find(p => p.symbol === searchSymbol);
      
      if (binancePrice) {
        const price = parseFloat(binancePrice.price);
        console.log(`Found Binance price for ${symbol}:`, price);
        
        prices.push({
          symbol,
          price,
          timestamp
        });

        // Store price in database
        const { error: insertError } = await supabase
          .from('historical_prices')
          .insert({
            symbol,
            price,
            timestamp
          });

        if (insertError) {
          console.error(`Error storing price for ${symbol}:`, insertError);
        }
      } else {
        console.log(`No Binance price found for ${symbol}, trying CoinCap...`);
        
        // Try CoinCap as fallback
        try {
          const coinCapResponse = await fetch(`https://api.coincap.io/v2/assets/${symbol.toLowerCase()}`);
          if (coinCapResponse.ok) {
            const coinCapData = await coinCapResponse.json();
            const price = parseFloat(coinCapData.data.priceUsd);
            
            if (price) {
              console.log(`Found CoinCap price for ${symbol}:`, price);
              
              prices.push({
                symbol,
                price,
                timestamp
              });

              // Store price in database
              const { error: insertError } = await supabase
                .from('historical_prices')
                .insert({
                  symbol,
                  price,
                  timestamp
                });

              if (insertError) {
                console.error(`Error storing price for ${symbol}:`, insertError);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching CoinCap price for ${symbol}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: prices.length, prices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});