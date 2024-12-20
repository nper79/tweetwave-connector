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

    // Create Supabase client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const timestamp = new Date().toISOString();
    const prices = [];

    // Process all symbols concurrently using Promise.all
    await Promise.all(symbols.map(async (symbol) => {
      console.log(`Processing ${symbol}...`);
      let price = null;

      // Generate a unique request ID for this symbol
      const requestId = `${symbol}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      console.log(`Request ID for ${symbol}: ${requestId}`);

      // 1. Try Binance first
      try {
        const binanceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
        if (binanceResponse.ok) {
          const binanceData = await binanceResponse.json();
          if (binanceData.price) {
            price = parseFloat(binanceData.price);
            console.log(`[${requestId}] Found Binance price for ${symbol}:`, price);
          }
        }
      } catch (error) {
        console.error(`[${requestId}] Binance error for ${symbol}:`, error);
      }

      // 2. Try CoinGecko if Binance fails
      if (!price) {
        try {
          const geckoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
          if (geckoResponse.ok) {
            const geckoData = await geckoResponse.json();
            if (geckoData[symbol.toLowerCase()]?.usd) {
              price = geckoData[symbol.toLowerCase()].usd;
              console.log(`[${requestId}] Found CoinGecko price for ${symbol}:`, price);
            }
          }
        } catch (error) {
          console.error(`[${requestId}] CoinGecko error for ${symbol}:`, error);
        }
      }

      // 3. Try CoinCap as last resort
      if (!price) {
        try {
          const coincapResponse = await fetch(`https://api.coincap.io/v2/assets/${symbol.toLowerCase()}`);
          if (coincapResponse.ok) {
            const coincapData = await coincapResponse.json();
            if (coincapData.data?.priceUsd) {
              price = parseFloat(coincapData.data.priceUsd);
              console.log(`[${requestId}] Found CoinCap price for ${symbol}:`, price);
            }
          }
        } catch (error) {
          console.error(`[${requestId}] CoinCap error for ${symbol}:`, error);
        }
      }

      if (price) {
        prices.push({
          symbol,
          price,
          timestamp
        });

        // Store price in database using upsert to handle concurrent writes
        const { error: insertError } = await supabase
          .from('historical_prices')
          .upsert({
            symbol,
            price,
            timestamp
          }, {
            onConflict: 'symbol,timestamp'
          });

        if (insertError) {
          console.error(`[${requestId}] Error storing price for ${symbol}:`, insertError);
        } else {
          console.log(`[${requestId}] Successfully stored price for ${symbol}`);
        }
      } else {
        console.log(`[${requestId}] No price found for ${symbol} from any source`);
      }
    }));

    return new Response(
      JSON.stringify({ success: true, count: prices.length, prices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});