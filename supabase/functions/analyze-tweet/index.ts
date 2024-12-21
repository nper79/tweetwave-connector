import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tweet } = await req.json();
    console.log('Analyzing tweet:', tweet);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a crypto prediction analyzer. Analyze tweets to identify if they contain cryptocurrency price predictions.
            Consider a tweet as a prediction if it:
            1. Mentions a specific cryptocurrency (usually with $ symbol)
            2. Contains either:
               - A specific price target (e.g., "$45k", "45,000")
               - A clear directional movement with timeframe (e.g., "will pump this week", "dropping to X by Friday")
               - Technical analysis leading to a price conclusion
            
            Return a JSON object with:
            - isPrediction (boolean): true if tweet contains a price prediction
            - crypto (string): the cryptocurrency symbol (e.g., "BTC")
            - targetPrice (number): predicted price target (null if no specific target)
            - confidence (number): 0-1 score of how confident this is a real prediction
            - reasoning (string): brief explanation of why this is or isn't a prediction
            
            Examples of predictions:
            - "$BTC looking strong, target $45k by end of month"
            - "ETH will pump to $3000 this week"
            - "$SOL forming a bull flag, expecting $120 soon"
            - "BTC headed down to 38k support level"
            
            Examples of non-predictions:
            - "BTC chart looking bullish"
            - "Love the SOL ecosystem"
            - "ETH having a good day"`
          },
          {
            role: 'user',
            content: tweet
          }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    console.log('AI Analysis:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing tweet:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});