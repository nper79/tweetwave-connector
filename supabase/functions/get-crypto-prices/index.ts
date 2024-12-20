import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const symbols = url.searchParams.get('symbols')
    
    if (!symbols) {
      return new Response(
        JSON.stringify({ error: 'Symbols parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const apiResponse = await fetch(
      `https://8394cea1-cd61-4ee4-a8e6-92a205cf7c17-00-3komcir7xic0l.riker.replit.dev/api/v1/prices?symbols=${symbols}&exchange=kraken`
    )

    const data = await apiResponse.json()

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch crypto prices' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})