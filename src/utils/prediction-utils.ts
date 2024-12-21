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
    const { data, error } = await supabase.functions.invoke('analyze-tweet', {
      body: { tweet: tweet.text }
    });

    if (error) {
      console.error('Error analyzing tweet:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error parsing AI analysis:', error);
    return null;
  }
};

export const isPredictionTweet = (tweet: Tweet | null): boolean => {
  if (!tweet?.text) return false;
  
  // Basic check with rules
  return hasCryptoSymbol(tweet.text) && 
    (hasPredictionKeyword(tweet.text) || hasTechnicalAnalysis(tweet.text));
};

export const extractCryptoSymbol = (text: string): string => {
  const match = text.match(/\$[A-Z]{2,}/);
  return match ? match[0].replace(/^\$/, '') : 'BTC';
};

export const extractTargetPrice = (text: string): number | null => {
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