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
    
    const cryptos = ['BTC', 'ETH', 'SOL', 'XRP', 'PEPE', 'FLOKI'];
    const prices = [];

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

    for (const symbol of cryptos) {
      console.log(`Processing ${symbol} price...`);
      
      // Binance uses USDT pairs for most cryptocurrencies
      const binanceSymbol = `${symbol}USDT`;
      const priceData = allPrices.find(p => p.symbol === binanceSymbol);
      
      if (priceData) {
        const price = parseFloat(priceData.price);
        console.log(`Found price for ${symbol}:`, price);
        
        prices.push({
          symbol,
          price,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`No price found for ${symbol}`);
      }
    }

    console.log(`Successfully processed ${prices.length} prices:`, prices);

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