import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting crypto price fetch from Binance API...');
    
    // Get the requested symbols from the request body
    const { symbols = [] } = await req.json();
    console.log('Requested symbols:', symbols);

    if (!symbols || symbols.length === 0) {
      console.error('No symbols provided in request');
      return new Response(
        JSON.stringify({ error: 'No symbols provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Fetch all prices at once from Binance
    const response = await fetch('https://api.binance.com/api/v3/ticker/price');
    
    if (!response.ok) {
      console.error('Error fetching from Binance:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch prices from Binance',
          details: errorText 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    const allPrices = await response.json();
    console.log('Successfully fetched all prices from Binance');

    const prices = [];
    const timestamp = new Date().toISOString();

    for (const symbol of symbols) {
      console.log(`Processing ${symbol} price...`);
      
      // Make sure we're looking for the symbol with USDT suffix
      const searchSymbol = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
      const priceData = allPrices.find(p => p.symbol === searchSymbol);
      
      if (priceData) {
        const price = parseFloat(priceData.price);
        console.log(`Found price for ${symbol}:`, price);
        
        // Store without USDT suffix
        const cleanSymbol = symbol.replace(/USDT$/i, '');
        prices.push({
          symbol: cleanSymbol,
          price,
          timestamp
        });
      } else {
        console.log(`No price found for ${searchSymbol}`);
      }
    }

    console.log(`Successfully processed ${prices.length} prices:`, prices);

    if (prices.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No prices found for provided symbols',
          requestedSymbols: symbols 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Insert prices into the database
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const price of prices) {
      const { error: insertError } = await supabase
        .from('historical_prices')
        .insert({
          symbol: price.symbol,
          price: price.price,
          timestamp: price.timestamp
        });

      if (insertError) {
        console.error(`Error inserting price for ${price.symbol}:`, insertError);
      } else {
        console.log(`Successfully stored price for ${price.symbol}`);
      }
    }

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