import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoinCapResponse {
  data: {
    id: string;
    symbol: string;
    priceUsd: string;
  }[];
  timestamp: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CoinCap price fetch...');
    
    // Get API key from environment
    const apiKey = Deno.env.get('COINCAP_API_KEY');
    if (!apiKey) {
      throw new Error('CoinCap API key not found');
    }

    // Fetch prices from CoinCap API
    const response = await fetch('https://api.coincap.io/v2/assets?limit=2000', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinCap API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`CoinCap API error: ${response.statusText || errorText}`);
    }

    const data: CoinCapResponse = await response.json();
    console.log(`Fetched ${data.data.length} prices from CoinCap`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store prices in our database
    const timestamp = new Date().toISOString();
    const prices = data.data.map(coin => ({
      symbol: coin.symbol,
      price: parseFloat(coin.priceUsd),
      timestamp
    }));

    const { error: insertError } = await supabase
      .from('historical_prices')
      .insert(prices);

    if (insertError) {
      console.error('Error storing prices:', insertError);
      throw insertError;
    }

    console.log(`Successfully stored ${prices.length} prices in database`);

    return new Response(
      JSON.stringify({ success: true, count: prices.length }),
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