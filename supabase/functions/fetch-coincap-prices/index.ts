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
    console.log('Starting crypto price fetch using CoinCap API...');
    
    const apiKey = Deno.env.get('COINCAP_API_KEY');
    if (!apiKey) {
      console.error('CoinCap API key not found');
      throw new Error('CoinCap API key not found');
    }

    const cryptos = ['bitcoin', 'ethereum', 'solana', 'ripple'];
    const prices = [];

    for (const id of cryptos) {
      const endpoint = `https://api.coincap.io/v2/assets/${id}`;
      console.log(`Fetching ${id} price from endpoint:`, endpoint);
      
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (!response.ok) {
          console.error(`Error fetching ${id}:`, response.status, response.statusText);
          const errorText = await response.text();
          console.error(`Error details for ${id}:`, errorText);
          continue;
        }

        const data = await response.json();
        console.log(`Raw data for ${id}:`, data);

        if (data && data.data && data.data.priceUsd) {
          const price = parseFloat(data.data.priceUsd);
          console.log(`Parsed price for ${id}:`, price);
          
          // Map the id to symbol for consistency with the frontend
          const symbolMap: { [key: string]: string } = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'solana': 'SOL',
            'ripple': 'XRP'
          };
          
          prices.push({
            symbol: symbolMap[id],
            price,
            timestamp: new Date().toISOString()
          });
        } else {
          console.error(`Invalid data format for ${id}:`, data);
        }
      } catch (error) {
        console.error(`Failed to fetch ${id}:`, error);
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