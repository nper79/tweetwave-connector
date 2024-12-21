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
    console.log('Analyzing tweet:', tweet.text);

    // Check if tweet has media
    const hasImage = tweet.media?.photo && tweet.media.photo[0]?.media_url_https;
    console.log('Has image:', hasImage);

    const messages = [
      {
        role: 'system',
        content: `You are a cryptocurrency prediction analyzer specialized in technical analysis. Your task is to analyze tweets and their associated charts to identify price predictions. Return ONLY a JSON object.

Key analysis points:
1. Technical Analysis Indicators:
- Look for chart patterns (triangles, wedges, support/resistance)
- Trend lines and price action
- Technical indicators mentioned
- Buy/Sell zones marked

2. Price Movement Predictions:
- Directional indicators (arrows, trend lines showing future movement)
- Support/Resistance levels
- Target prices or zones
- Entry/Exit points

3. Explicit/Implicit Predictions:
- Direct statements about price movements
- Technical analysis terms implying future movement
- Breakout/Breakdown predictions
- Target levels or zones

4. Time Horizons:
- Short-term vs long-term analysis
- Specific timeframes mentioned
- Chart timeframe shown

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
        content: hasImage 
          ? [
              { 
                type: "text", 
                text: `Analyze this crypto tweet and its chart: ${tweet.text}`
              },
              {
                type: "image_url",
                image_url: tweet.media.photo[0].media_url_https
              }
            ]
          : tweet.text
      }
    ];

    console.log('Sending request to OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log('AI Response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let analysis;
    try {
      analysis = JSON.parse(data.choices[0].message.content);
      console.log('Parsed Analysis:', analysis);

      // Enhance analysis based on technical indicators
      if (hasImage) {
        analysis.analysis.hasTechnicalAnalysis = true;
        analysis.confidence = Math.max(analysis.confidence, 0.7);
        
        // If we see directional arrows or trend lines in a chart, it's likely a prediction
        if (!analysis.isPrediction) {
          analysis.isPrediction = true;
          analysis.reasoning += " Chart shows technical analysis with directional indicators.";
        }
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', data.choices[0].message.content);
      throw new Error('Failed to parse AI analysis');
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