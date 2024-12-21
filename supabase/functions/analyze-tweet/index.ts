import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const fallbackAnalysis = (tweet: string) => {
  // Basic analysis without API
  const hasPriceTarget = /\$\d+(?:,\d{3})*(?:\.\d+)?[kK]?|\d+(?:,\d{3})*(?:\.\d+)?[kK]?\s*(?:dollars?|usd)/i.test(tweet);
  const hasCrypto = /\$[A-Z]{2,}|(?:^|\s)(?:BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC|LINK|UNI|AAVE|SNX|SUSHI)(?:\s|$)/i.test(tweet);
  const hasPredictionKeyword = /(predict|will|expect|target|breakout|soon|this week|next week|this month)/i.test(tweet);
  
  const cryptoMatch = tweet.match(/\$([A-Z]{2,})|(?:^|\s)(BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC|LINK|UNI|AAVE|SNX|SUSHI)(?:\s|$)/i);
  const priceMatch = tweet.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/);
  
  return {
    isPrediction: hasPriceTarget && hasCrypto && hasPredictionKeyword,
    crypto: cryptoMatch ? (cryptoMatch[1] || cryptoMatch[2]).toUpperCase() : null,
    targetPrice: priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null,
    confidence: 0.7,
    timeframe: null,
    analysis: {
      hasExplicitStatement: hasPredictionKeyword,
      hasPriceTarget,
      hasTimeframe: /(soon|this week|next week|this month)/i.test(tweet),
      hasTechnicalAnalysis: /(support|resistance|breakout|trend)/i.test(tweet),
      hasSentiment: /(bullish|bearish|explosive|🚀)/i.test(tweet),
      hasConditional: /(if|when|once|after)/i.test(tweet),
      hasMarketTrend: /(dominance|correlation|cycle)/i.test(tweet),
      hasContext: true
    },
    reasoning: "Fallback analysis using pattern matching"
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tweet } = await req.json();
    console.log('Analyzing tweet:', tweet);

    const grokApiKey = Deno.env.get('GROK_API_KEY');
    if (!grokApiKey) {
      console.log('No GROK_API_KEY found, using fallback analysis');
      return new Response(
        JSON.stringify(fallbackAnalysis(tweet)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Test API connection
      console.log('Testing Grok API connection...');
      const testResponse = await fetch('https://api.grok.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!testResponse.ok) {
        console.log('Grok API connection failed, using fallback analysis');
        return new Response(
          JSON.stringify(fallbackAnalysis(tweet)),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Proceed with Grok API analysis
      console.log('Grok API connection successful, proceeding with analysis...');
      const response = await fetch('https://api.grok.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-1',
          messages: [
            {
              role: 'system',
              content: `You are a cryptocurrency prediction analyzer. Your task is to analyze tweets and extract cryptocurrency price predictions. Return ONLY a JSON object with no additional text.

Analyze based on these criteria:
1. Look for explicit predictions ("predict", "will", "expect", "target", "might", "could")
2. Check for price targets (specific numbers with $ or without, or multipliers like "2X", "10X")
3. Look for timeframes ("soon", "this week", "next month", "2024", "2025", etc)
4. Check for technical analysis terms ("support", "resistance", "breakout")
5. Look for sentiment indicators ("bullish", "bearish", "explosive", "🚀")
6. Identify conditional statements ("if", "when", "after")
7. Look for market trend predictions ("dominance", "correlation", "cycle")

Return this exact JSON structure:
{
  "isPrediction": boolean,
  "crypto": string | null,
  "targetPrice": number | null,
  "confidence": number,
  "timeframe": string | null,
  "analysis": {
    "hasExplicitStatement": boolean,
    "hasPriceTarget": boolean,
    "hasTimeframe": boolean,
    "hasTechnicalAnalysis": boolean,
    "hasSentiment": boolean,
    "hasConditional": boolean,
    "hasMarketTrend": boolean,
    "hasContext": boolean
  },
  "reasoning": string
}`
            },
            {
              role: 'user',
              content: tweet
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.log('Grok API analysis failed, using fallback analysis');
        return new Response(
          JSON.stringify(fallbackAnalysis(tweet)),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Grok API Response:', data);

      if (!data.choices?.[0]?.message?.content) {
        console.log('Invalid Grok API response format, using fallback analysis');
        return new Response(
          JSON.stringify(fallbackAnalysis(tweet)),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let analysis = JSON.parse(data.choices[0].message.content);
      console.log('Parsed Analysis:', analysis);

      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error with Grok API:', error);
      console.log('Using fallback analysis due to API error');
      return new Response(
        JSON.stringify(fallbackAnalysis(tweet)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error analyzing tweet:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isPrediction: false,
        confidence: 0,
        analysis: {
          hasExplicitStatement: false,
          hasPriceTarget: false,
          hasTimeframe: false,
          hasTechnicalAnalysis: false,
          hasSentiment: false,
          hasConditional: false,
          hasMarketTrend: false,
          hasContext: false
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});