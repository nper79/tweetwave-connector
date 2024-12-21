import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const grokApiKey = Deno.env.get('GROK_API_KEY');

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
    console.log('Analyzing tweet:', tweet.text);

    const response = await fetch('https://api.xai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-vision-1212',
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
            content: tweet.text
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log('Grok Response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Grok');
    }

    let analysis;
    try {
      analysis = JSON.parse(data.choices[0].message.content);
      console.log('Parsed Analysis:', analysis);

      // Enhance prediction detection for common patterns
      if (
        (tweet.text.includes('🚀') && /\d+[xX]/.test(tweet.text)) || // Rocket emoji with multiplier
        /\$?\d+(?:,\d{3})*(?:\.\d+)?[kK]?\s*(?:target|prediction)/i.test(tweet.text) || // Price targets
        /(will|gonna|going to)\s+(?:moon|pump|explode)/i.test(tweet.text) // Common prediction phrases
      ) {
        analysis.isPrediction = true;
        analysis.confidence = Math.max(analysis.confidence, 0.7);
        analysis.analysis.hasExplicitStatement = true;
      }

    } catch (error) {
      console.error('Error parsing Grok response:', error);
      console.log('Raw Grok response:', data.choices[0].message.content);
      throw new Error('Failed to parse Grok analysis');
    }

    return new Response(
      JSON.stringify(analysis),
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