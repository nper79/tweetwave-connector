import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    // Get API key from environment
    const apiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!apiKey) {
      throw new Error('RapidAPI key not found');
    }

    // List of cryptocurrencies we want to fetch
    const cryptos = ['BTC', 'ETH', 'SOL', 'XRP'];
    const prices = [];

    // Fetch prices for each crypto
    for (const symbol of cryptos) {
      const endpoint = `https://crypto-market-prices.p.rapidapi.com/price?symbol=${symbol}USDT`;
      console.log(`Fetching price for ${symbol} from endpoint:`, endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          'x-rapidapi-host': 'crypto-market-prices.p.rapidapi.com',
          'x-rapidapi-key': apiKey
        }
      });

      if (!response.ok) {
        console.error(`Error fetching ${symbol}:`, response.statusText);
        continue;
      }

      const data = await response.json();
      console.log(`Received data for ${symbol}:`, data);

      if (data && data.price) {
        prices.push({
          symbol,
          price: parseFloat(data.price),
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(`Successfully fetched ${prices.length} prices`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store prices in our database
    if (prices.length > 0) {
      const { error: insertError } = await supabase
        .from('historical_prices')
        .insert(prices);

      if (insertError) {
        console.error('Error storing prices:', insertError);
        throw insertError;
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
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})