import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { tweet } = await req.json()
    console.log('Analyzing tweet:', tweet)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a crypto prediction analyzer. Analyze tweets to identify if they contain cryptocurrency price predictions.
            Return a JSON object with:
            - isPrediction (boolean): true if tweet contains a price prediction
            - crypto (string): the cryptocurrency symbol (e.g., "BTC")
            - targetPrice (number): predicted price target
            - confidence (number): 0-1 score of how confident this is a real prediction
            - reasoning (string): brief explanation of why this is or isn't a prediction
            
            Example of a prediction: "$BTC looking strong, target $45k by end of month"
            Example of not a prediction: "$BTC chart looking bullish"`
          },
          {
            role: 'user',
            content: tweet
          }
        ],
        temperature: 0.1,
      }),
    })

    const data = await response.json()
    console.log('AI Analysis:', data.choices[0].message.content)

    return new Response(
      JSON.stringify(data.choices[0].message.content),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error analyzing tweet:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})