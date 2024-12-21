import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";

const PREDICTION_KEYWORDS = [
  // Price movement keywords
  'target', 'expect', 'prediction', 'predict',
  'will reach', 'going to', 'headed to',
  // Timeframe keywords
  'soon', 'this week', 'next week', 'this month',
  'by end of', 'tomorrow', 'tonight',
  // Direction keywords
  'pump', 'moon', 'rise', 'surge', 'rally',
  'dip', 'drop', 'fall', 'decline',
  // Technical analysis
  'support', 'resistance', 'breakout',
  'pattern', 'trend', 'setup'
] as const;

const TECHNICAL_ANALYSIS_TERMS = [
  'wedge', 'pattern', 'trend', 'level',
  'fibonacci', 'fib', 'retrace',
  'channel', 'triangle', 'flag',
  'head and shoulders', 'double top', 'double bottom',
  'support', 'resistance', 'breakout',
  'accumulation', 'distribution'
] as const;

export const hasCryptoSymbol = (text: string): boolean => {
  // Match both $BTC style and plain BTC mentions
  return /\$[A-Z]{2,}|(?:^|\s)(?:BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC)(?:\s|$)/.test(text);
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
  
  // Enhanced fallback logic
  const text = tweet.text.toLowerCase();
  const hasCrypto = hasCryptoSymbol(tweet.text);
  const hasPrediction = hasPredictionKeyword(text);
  const hasTA = hasTechnicalAnalysis(text);
  
  // Look for price patterns
  const hasPriceTarget = /\$\d+(?:,\d{3})*(?:\.\d+)?[kK]?|\d+(?:,\d{3})*(?:\.\d+)?[kK]?\s*(?:dollars?|usd)/i.test(tweet.text);
  
  // Check for timeframe mentions
  const hasTimeframe = /(?:today|tomorrow|tonight|this week|next week|this month|soon)/i.test(text);
  
  // Return true if we have a crypto symbol AND either:
  // 1. A price target
  // 2. Technical analysis terms
  // 3. A prediction keyword with a timeframe
  return hasCrypto && (
    hasPriceTarget ||
    hasTA ||
    (hasPrediction && hasTimeframe)
  );
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

  // Enhanced regex pattern to catch both $BTC and plain BTC
  const symbolMatch = text.match(/\$([A-Z]{2,})|(?:^|\s)(BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC)(?:\s|$)/);
  return symbolMatch ? (symbolMatch[1] || symbolMatch[2]) : 'BTC';
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
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/,
    /(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?\s*(?:dollars?|usd)/i
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