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
  return text.includes('$') && /\$[A-Z]{2,}/.test(text);
};

export const hasPredictionKeyword = (text: string): boolean => {
  return PREDICTION_KEYWORDS.some(keyword => text.includes(keyword));
};

export const hasTechnicalAnalysis = (text: string): boolean => {
  return TECHNICAL_ANALYSIS_TERMS.some(term => text.includes(term));
};

export const isPredictionTweet = (tweet: Tweet): boolean => {
  if (!tweet?.text) return false;
  
  const text = tweet.text.toLowerCase();
  
  return hasCryptoSymbol(text) && (hasPredictionKeyword(text) || hasTechnicalAnalysis(text));
};

export const extractCryptoSymbol = (text: string): string => {
  const match = text.match(/\$[A-Z]{2,}/);
  return match ? match[0].substring(1) : 'BTC';
};

export const extractTargetPrice = (text: string): number | null => {
  // Look for explicit target prices
  const targetMatch = text.match(/target:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i);
  if (targetMatch) return parseFloat(targetMatch[1].replace(/,/g, ''));
  
  // Look for price levels or projections
  const priceMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (priceMatch) return parseFloat(priceMatch[1].replace(/,/g, ''));
  
  return null;
};