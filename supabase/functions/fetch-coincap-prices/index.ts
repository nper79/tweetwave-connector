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
    console.log('Starting crypto price fetch...');
    
    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!apiKey) {
      console.error('RapidAPI key not found');
      throw new Error('RapidAPI key not found');
    }

    const cryptos = ['BTC', 'ETH', 'SOL', 'XRP', 'PEPE', 'FLOKI'];
    const prices = [];

    for (const symbol of cryptos) {
      // Use the /tokens endpoint for all cryptocurrencies
      const endpoint = `https://crypto-market-prices.p.rapidapi.com/tokens/${symbol}`;
      console.log(`Fetching ${symbol} price from endpoint:`, endpoint);
      
      try {
        const response = await fetch(endpoint, {
          headers: {
            'x-rapidapi-host': 'crypto-market-prices.p.rapidapi.com',
            'x-rapidapi-key': apiKey
          }
        });

        if (!response.ok) {
          console.error(`Error fetching ${symbol}:`, response.status, response.statusText);
          const errorText = await response.text();
          console.error(`Error details for ${symbol}:`, errorText);
          continue;
        }

        const data = await response.json();
        console.log(`Raw data for ${symbol}:`, data);

        if (data && data.data && data.data.price) {
          const price = parseFloat(data.data.price);
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