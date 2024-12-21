import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
const GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const testGrokAPI = async () => {
  console.log("Testing Grok API connection...");
  console.log("API Key present:", !!GROK_API_KEY);
  
  try {
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: "test" }],
      }),
    });

    console.log("Grok API Response Status:", response.status);
    const data = await response.text();
    console.log("Grok API Response:", data);

    return response.ok;
  } catch (error) {
    console.error("Grok API Error:", error.message);
    return false;
  }
};

const analyzeTweet = (tweet: string) => {
  console.log('Analyzing tweet:', tweet);
  
  // Enhanced pattern matching for better prediction detection
  const patterns = {
    priceTarget: /\$(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?|\d+(?:,\d{3})*(?:\.\d+)?[kK]?\s*(?:dollars?|usd)/i,
    crypto: /\$([A-Z]{2,})|(?:^|\s)(BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC|LINK|UNI|AAVE|SNX|SUSHI)(?:\s|$)/i,
    predictionKeywords: /(predict|will|expect|target|breakout|soon|this week|next week|this month)/i,
    technicalAnalysis: /(support|resistance|breakout|trend|pattern|fibonacci|accumulation|distribution)/i,
    sentiment: /(bullish|bearish|explosive|🚀|moon|dump|pump)/i,
    timeframe: /(today|tomorrow|tonight|this week|next week|this month|soon|bull run|cycle)/i,
    conditional: /(if|when|once|after)/i,
    marketTrend: /(dominance|correlation|cycle|market structure|trend)/i
  };

  // Extract price target
  const priceMatch = tweet.match(patterns.priceTarget);
  const targetPrice = priceMatch 
    ? parseFloat(priceMatch[1].replace(/,/g, '')) * (priceMatch[0].toLowerCase().includes('k') ? 1000 : 1)
    : null;

  // Extract crypto symbol
  const cryptoMatch = tweet.match(patterns.crypto);
  const crypto = cryptoMatch ? (cryptoMatch[1] || cryptoMatch[2]).toUpperCase() : null;

  // Analyze different aspects
  const analysis = {
    hasExplicitStatement: patterns.predictionKeywords.test(tweet),
    hasPriceTarget: patterns.priceTarget.test(tweet),
    hasTimeframe: patterns.timeframe.test(tweet),
    hasTechnicalAnalysis: patterns.technicalAnalysis.test(tweet),
    hasSentiment: patterns.sentiment.test(tweet),
    hasConditional: patterns.conditional.test(tweet),
    hasMarketTrend: patterns.marketTrend.test(tweet),
    hasContext: true
  };

  // Calculate confidence based on number of matching criteria
  const matchingCriteria = Object.values(analysis).filter(Boolean).length;
  const confidence = Math.min(0.4 + (matchingCriteria * 0.1), 0.9);

  // Extract timeframe
  const timeframeMatch = tweet.match(patterns.timeframe);
  const timeframe = timeframeMatch ? timeframeMatch[0] : null;

  // Determine if it's a prediction based on multiple factors
  const isPrediction = analysis.hasPriceTarget && 
    crypto !== null && 
    (analysis.hasExplicitStatement || (analysis.hasTechnicalAnalysis && analysis.hasTimeframe));

  return {
    isPrediction,
    crypto,
    targetPrice,
    confidence,
    timeframe,
    analysis,
    reasoning: `Analysis based on pattern matching: Found ${matchingCriteria} matching criteria`
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tweet } = await req.json();
    console.log('Analyzing tweet:', tweet);

    // Test API connection first
    const isGrokAvailable = await testGrokAPI();
    console.log("Grok API available:", isGrokAvailable);

    let result;
    if (isGrokAvailable) {
      console.log("Using Grok API for analysis");
      // Add your Grok API analysis code here if needed
      result = analyzeTweet(tweet); // Fallback for now
    } else {
      console.log("Using fallback analysis due to API error");
      result = analyzeTweet(tweet);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
