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
    console.log('Starting crypto price fetch from Yahoo Finance...');
    
    const cryptos = ['BTC', 'ETH', 'SOL', 'XRP', 'PEPE', 'FLOKI'];
    const prices = [];

    for (const symbol of cryptos) {
      console.log(`Fetching ${symbol} price...`);
      
      try {
        // Yahoo Finance uses -USD suffix for crypto pairs
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}-USD`);

        if (!response.ok) {
          console.error(`Error fetching ${symbol}:`, response.status, response.statusText);
          const errorText = await response.text();
          console.error(`Error details for ${symbol}:`, errorText);
          continue;
        }

        const data = await response.json();
        console.log(`Raw data for ${symbol}:`, data);

        if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
          const price = data.chart.result[0].meta.regularMarketPrice;
          console.log(`Parsed price for ${symbol}:`, price);
          
          prices.push({
            symbol,
            price,
            timestamp: new Date().toISOString()
          });
        } else {
          console.error(`Invalid data format for ${symbol}:`, data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
      }
    }

    console.log(`Successfully fetched ${prices.length} prices:`, prices);

    return new Response(
      JSON.stringify({ success: true, count: prices.length, prices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        name: error.name 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})