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
            content: `You are a crypto prediction analyzer. Analyze tweets to identify cryptocurrency price predictions using these specific criteria:

1. Explicit Prediction Statements:
- Look for direct statements using words like "predict", "will go", "expect"
- Identify implicit predictions through phrases like "breakout targets", "looking for", "should reach"

2. Price Targets:
- Identify specific price levels (e.g., "$0.06", "$2.50")
- Look for target prices with entry/exit points
- Note both absolute values and percentage changes

3. Time-bound Forecasts:
- Identify timeframes ("next few months", "this week", "by EOY")
- Look for both specific dates and general timeframes
- Consider market cycle references (e.g., "this bull run")

4. Technical Analysis Indicators:
- Recognize TA terms: "breakout", "support", "resistance", "buy zone"
- Look for chart pattern references
- Consider trend analysis mentions

5. Sentiment Analysis:
- Evaluate bullish/bearish language
- Look for emotional indicators ("explosive", "huge potential")
- Consider market sentiment references

6. Conditional Predictions:
- Identify "if/then" statements
- Look for cause-effect relationships
- Note market condition dependencies

7. Market Trends:
- Recognize broader market predictions
- Look for dominance/correlation references
- Consider macro trend analysis

8. Contextual Clarity:
- Verify specific cryptocurrency mentions
- Check for chart/data references
- Ensure clear subject matter

Return a JSON object with:
- isPrediction (boolean): true if tweet meets prediction criteria
- crypto (string): the cryptocurrency symbol
- targetPrice (number): predicted price target (null if no specific target)
- confidence (number): 0-1 score based on how many criteria are met
- timeframe (string): identified timeframe (null if none)
- analysis: {
  hasExplicitStatement: boolean,
  hasPriceTarget: boolean,
  hasTimeframe: boolean,
  hasTechnicalAnalysis: boolean,
  hasSentiment: boolean,
  hasConditional: boolean,
  hasMarketTrend: boolean,
  hasContext: boolean
}
- reasoning (string): brief explanation of the analysis`
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
    console.log('AI Response:', data);
    
    const analysis = JSON.parse(data.choices[0].message.content);
    console.log('Parsed Analysis:', analysis);

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