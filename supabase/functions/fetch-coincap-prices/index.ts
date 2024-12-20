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

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const timestamp = new Date().toISOString();
    const pricePromises = symbols.map(async (symbol) => {
      const requestId = `${symbol}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      console.log(`[${requestId}] Starting price fetch for ${symbol}`);
      
      try {
        // Try Binance first
        const binanceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
        if (binanceResponse.ok) {
          const binanceData = await binanceResponse.json();
          if (binanceData.price) {
            const price = parseFloat(binanceData.price);
            console.log(`[${requestId}] Got Binance price for ${symbol}: ${price}`);
            return { symbol, price, timestamp, source: 'binance' };
          }
        }

        // Try CoinGecko as fallback
        const geckoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
        if (geckoResponse.ok) {
          const geckoData = await geckoResponse.json();
          if (geckoData[symbol.toLowerCase()]?.usd) {
            const price = geckoData[symbol.toLowerCase()].usd;
            console.log(`[${requestId}] Got CoinGecko price for ${symbol}: ${price}`);
            return { symbol, price, timestamp, source: 'coingecko' };
          }
        }

        // Try CoinCap as last resort
        const coincapResponse = await fetch(`https://api.coincap.io/v2/assets/${symbol.toLowerCase()}`);
        if (coincapResponse.ok) {
          const coincapData = await coincapResponse.json();
          if (coincapData.data?.priceUsd) {
            const price = parseFloat(coincapData.data.priceUsd);
            console.log(`[${requestId}] Got CoinCap price for ${symbol}: ${price}`);
            return { symbol, price, timestamp, source: 'coincap' };
          }
        }

        console.log(`[${requestId}] No price found for ${symbol} from any source`);
        return null;
      } catch (error) {
        console.error(`[${requestId}] Error fetching price for ${symbol}:`, error);
        return null;
      }
    });

    const priceResults = await Promise.all(pricePromises);
    const validPrices = priceResults.filter(result => result !== null);

    if (validPrices.length > 0) {
      const { error: upsertError } = await supabase
        .from('historical_prices')
        .upsert(
          validPrices.map(({ symbol, price, timestamp }) => ({
            symbol,
            price,
            timestamp
          })),
          { onConflict: 'symbol,timestamp' }
        );

      if (upsertError) {
        console.error('Batch upsert error:', upsertError);
      } else {
        console.log(`Successfully stored ${validPrices.length} prices`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: validPrices.length, 
        prices: validPrices 
      }),
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