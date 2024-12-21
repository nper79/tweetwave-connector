import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";

const PREDICTION_KEYWORDS = [
  // Explicit prediction keywords
  'predict', 'will', 'expect', 'target', 'breakout',
  'looking for', 'should reach', 'potential',
  // Timeframe keywords
  'soon', 'this week', 'next week', 'this month',
  'by end of', 'tomorrow', 'tonight', 'bull run',
  // Technical analysis
  'support', 'resistance', 'breakout', 'pattern',
  'trend', 'setup', 'buy zone', 'sell zone',
  // Market sentiment
  'bullish', 'bearish', 'explosive', 'momentum',
  // Conditional keywords
  'if', 'when', 'once', 'after',
  // Market trends
  'dominance', 'correlation', 'market cycle'
] as const;

const TECHNICAL_ANALYSIS_TERMS = [
  // Chart patterns
  'wedge', 'pattern', 'trend', 'channel',
  'triangle', 'flag', 'pennant',
  'head and shoulders', 'double top', 'double bottom',
  // Technical indicators
  'support', 'resistance', 'breakout',
  'fibonacci', 'fib', 'retrace',
  // Market structure
  'accumulation', 'distribution',
  'buy zone', 'sell zone',
  // Trend analysis
  'uptrend', 'downtrend', 'sideways',
  'consolidation', 'momentum'
] as const;

export const hasCryptoSymbol = (text: string): boolean => {
  // Match both $BTC style and plain BTC mentions
  // Extended to catch more crypto symbols
  return /\$[A-Z]{2,}|(?:^|\s)(?:BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC|LINK|UNI|AAVE|SNX|SUSHI)(?:\s|$)/i.test(text);
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
  timeframe: string | null;
  analysis: {
    hasExplicitStatement: boolean;
    hasPriceTarget: boolean;
    hasTimeframe: boolean;
    hasTechnicalAnalysis: boolean;
    hasSentiment: boolean;
    hasConditional: boolean;
    hasMarketTrend: boolean;
    hasContext: boolean;
  };
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
      console.log('AI analysis criteria met:', aiAnalysis.analysis);
      // Consider it a prediction if it meets multiple criteria with high confidence
      return aiAnalysis.isPrediction && aiAnalysis.confidence > 0.6;
    }
  } catch (error) {
    console.error('AI analysis failed, falling back to regex:', error);
  }
  
  // Enhanced fallback logic
  const text = tweet.text.toLowerCase();
  const hasCrypto = hasCryptoSymbol(tweet.text);
  const hasPrediction = hasPredictionKeyword(text);
  const hasTA = hasTechnicalAnalysis(text);
  
  // Look for price patterns (including K/k for thousands)
  const hasPriceTarget = /\$\d+(?:,\d{3})*(?:\.\d+)?[kK]?|\d+(?:,\d{3})*(?:\.\d+)?[kK]?\s*(?:dollars?|usd)/i.test(tweet.text);
  
  // Enhanced timeframe detection
  const hasTimeframe = /(?:today|tomorrow|tonight|this week|next week|this month|soon|bull run|cycle|trend)/i.test(text);
  
  // Return true if we have a crypto symbol AND either:
  // 1. A price target with timeframe
  // 2. Technical analysis terms with prediction keywords
  // 3. Multiple prediction indicators present
  return hasCrypto && (
    (hasPriceTarget && hasTimeframe) ||
    (hasTA && hasPrediction) ||
    (hasPrediction && hasTimeframe && (hasPriceTarget || hasTA))
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

  // Enhanced regex pattern to catch more crypto symbols
  const symbolMatch = text.match(/\$([A-Z]{2,})|(?:^|\s)(BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC|LINK|UNI|AAVE|SNX|SUSHI)(?:\s|$)/i);
  return symbolMatch ? (symbolMatch[1] || symbolMatch[2]).toUpperCase() : 'BTC';
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
    // Target price patterns
    /target:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/i,
    /price:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/i,
    // General price mentions
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/,
    /(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?\s*(?:dollars?|usd)/i,
    // Range patterns
    /between\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?\s*(?:and|-)\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)[kK]?/i
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