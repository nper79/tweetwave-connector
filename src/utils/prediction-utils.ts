import { Tweet } from "@/types/twitter";

// Keywords for different types of predictions
const PREDICTION_KEYWORDS = [
  'prediction', 'predict', 'target', 'expect', 'soon', 'coming',
  'dip', 'drop', 'fall', 'decline', 'bearish',
  'pump', 'rise', 'surge', 'bullish', 'moon',
  'support', 'resistance', 'break'
] as const;

const TECHNICAL_ANALYSIS_TERMS = [
  'wedge', 'pattern', 'trend', 'level', 'bottom',
  'fibonacci', 'fib', 'retrace', 'channel', 'triangle',
  'head and shoulders', 'double top', 'double bottom'
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
  return hasCryptoSymbol(tweet.text) && (hasPredictionKeyword(text) || hasTechnicalAnalysis(text));
};

export const extractCryptoSymbol = (text: string): string => {
  const match = text.match(/\$[A-Z]{2,}/);
  return match ? match[0].substring(1) : 'BTC';
};

export const extractTargetPrice = (text: string): number | null => {
  // Look for price patterns like $50k, $50K, or $50,000
  const pricePatterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)[kK]/, // Matches $50k or $50K
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)/ // Matches regular dollar amounts
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      // If the price ends with 'k' or 'K', multiply by 1000
      return match[0].toLowerCase().endsWith('k') ? value * 1000 : value;
    }
  }

  return null;
};