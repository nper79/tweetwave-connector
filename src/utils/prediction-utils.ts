import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";

const PREDICTION_KEYWORDS = [
  'prediction', 'predict', 'target', 'expect', 'soon', 'coming',
  'dip', 'drop', 'fall', 'decline', 'bearish',
  'pump', 'rise', 'surge', 'bullish', 'moon',
  'support', 'resistance', 'break', 'buy', 'sell'
] as const;

const TECHNICAL_ANALYSIS_TERMS = [
  'wedge', 'pattern', 'trend', 'level', 'bottom',
  'fibonacci', 'fib', 'retrace', 'channel', 'triangle',
  'head and shoulders', 'double top', 'double bottom',
  'support', 'resistance', 'breakout'
] as const;

export const hasCryptoSymbol = (text: string): boolean => {
  return /\$[A-Z]{2,}/.test(text);
};

export const hasPredictionKeyword = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return PREDICTION_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

export const hasTechnicalAnalysis = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return TECHNICAL_ANALYSIS_TERMS.some(term => lowerText.includes(term));
};

interface AIAnalysis {
  isPrediction: boolean;
  crypto: string | null;
  targetPrice: number | null;
  confidence: number;
  reasoning: string;
}

export const analyzeTweetWithAI = async (tweet: Tweet): Promise<AIAnalysis | null> => {
  try {
    console.log('Analyzing tweet with AI:', tweet.text);
    
    const { data, error } = await supabase.functions.invoke('analyze-tweet', {
      body: { tweet: tweet.text }
    });

    if (error) {
      console.error('Error analyzing tweet:', error);
      return null;
    }

    // The response should already be parsed JSON
    const analysis = data as AIAnalysis;
    console.log('AI Analysis result:', analysis);

    return analysis;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return null;
  }
};

export const isPredictionTweet = async (tweet: Tweet | null): Promise<boolean> => {
  if (!tweet?.text) return false;
  
  try {
    // First try AI analysis
    const aiAnalysis = await analyzeTweetWithAI(tweet);
    if (aiAnalysis) {
      console.log('AI confidence for prediction:', aiAnalysis.confidence);
      return aiAnalysis.isPrediction && aiAnalysis.confidence > 0.5;
    }
  } catch (error) {
    console.error('AI analysis failed, falling back to regex:', error);
  }
  
  // Fallback to basic checks if AI fails
  return hasCryptoSymbol(tweet.text) && 
    (hasPredictionKeyword(tweet.text) || hasTechnicalAnalysis(tweet.text));
};

export const extractCryptoSymbol = async (text: string, tweet: Tweet): Promise<string> => {
  try {
    const aiAnalysis = await analyzeTweetWithAI(tweet);
    if (aiAnalysis?.crypto) {
      return aiAnalysis.crypto;
    }
  } catch (error) {
    console.error('Error getting crypto from AI, falling back to regex:', error);
  }

  const match = text.match(/\$([A-Z]{2,})/);
  return match ? match[1] : 'BTC';
};

export const extractTargetPrice = async (text: string, tweet: Tweet): Promise<number | null> => {
  try {
    const aiAnalysis = await analyzeTweetWithAI(tweet);
    if (aiAnalysis?.targetPrice) {
      return aiAnalysis.targetPrice;
    }
  } catch (error) {
    console.error('Error getting target price from AI, falling back to regex:', error);
  }

  const pricePatterns = [
    /target:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/i,
    /price:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/i,
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      let value = parseFloat(match[1].replace(/,/g, ''));
      if (match[0].toLowerCase().includes('k')) {
        value *= 1000;
      }
      return value;
    }
  }

  return null;
};