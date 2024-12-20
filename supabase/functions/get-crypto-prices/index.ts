import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { symbol, start, end } = await req.json()
    console.log('Fetching price for symbol:', symbol)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase credentials')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // First try to get data from our database
    const startTime = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endTime = end || new Date().toISOString()

    const { data: historicalPrices, error: dbError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', symbol)
      .gte('timestamp', startTime)
      .lte('timestamp', endTime)
      .order('timestamp', { ascending: true })

    if (dbError) throw dbError

    // If we have recent data (last 24h), return it
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const hasRecentData = historicalPrices?.some(
      price => new Date(price.timestamp) > twentyFourHoursAgo
    )

    if (hasRecentData && historicalPrices.length > 0) {
      console.log('Returning cached historical prices')
      return new Response(
        JSON.stringify({
          history: historicalPrices.map(p => ({
            date: new Date(p.timestamp).getTime(),
            rate: p.price
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If we don't have recent data, fetch from LiveCoinWatch
    console.log('Fetching fresh data from LiveCoinWatch')
    const apiKey = await supabase.rpc('get_secret_value', { secret_name: 'LIVECOINWATCH_API_KEY' })
    if (!apiKey) throw new Error('LiveCoinWatch API key not found')

    const response = await fetch('https://api.livecoinwatch.com/coins/single/history', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        currency: 'USD',
        code: symbol,
        start: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: Date.now(),
        meta: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`LiveCoinWatch API error: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received new data from LiveCoinWatch')

    // Store the new prices in our database
    if (data.history && data.history.length > 0) {
      const newPrices = data.history.map((h: any) => ({
        symbol: symbol,
        price: h.rate,
        timestamp: new Date(h.date).toISOString()
      }))

      const { error: insertError } = await supabase
        .from('historical_prices')
        .upsert(newPrices, { 
          onConflict: 'symbol,timestamp',
          ignoreDuplicates: true 
        })

      if (insertError) console.error('Error storing prices:', insertError)
      else console.log('Successfully stored new prices')
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching price:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})