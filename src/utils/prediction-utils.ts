import { Tweet } from "@/types/twitter";

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

export const isPredictionTweet = (tweet: Tweet | null): tweet is Tweet => {
  if (!tweet?.text) return false;
  
  const text = tweet.text.toLowerCase();
  const isPrediction = hasCryptoSymbol(tweet.text) && (hasPredictionKeyword(text) || hasTechnicalAnalysis(text));
  
  // Only log if it's not a prediction
  if (!isPrediction && hasCryptoSymbol(tweet.text)) {
    console.log('Tweet contains crypto symbol but no prediction:', tweet.text);
  }
  
  return isPrediction;
};

export const extractCryptoSymbol = (text: string): string => {
  const match = text.match(/\$[A-Z]{2,}/);
  if (!match) {
    console.log('No crypto symbol found in text:', text);
    return 'BTC';
  }
  return match[0].replace(/^\$/, '');
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