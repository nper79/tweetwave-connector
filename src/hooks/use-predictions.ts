import { useQuery } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";

const isPredictionTweet = (tweet: Tweet) => {
  if (!tweet.text) return false;
  
  // Check for crypto symbols (e.g., $BTC, $ETH)
  const cryptoSymbolRegex = /\$[A-Z]{2,}/;
  const hasCryptoSymbol = cryptoSymbolRegex.test(tweet.text);
  
  // Check for price values (e.g., $50,000 or 50k)
  const priceRegex = /\$?\d+(?:,\d{3})*(?:\.\d+)?k?\s*(?:USD)?/i;
  const hasPrice = priceRegex.test(tweet.text);
  
  // Check for prediction keywords
  const predictionKeywords = [
    'target', 'prediction', 'predict', 'forecast',
    'expecting', 'expect', 'projected', 'analysis',
    'breakout', 'resistance', 'support', 'rally',
    'bullish', 'bearish', 'long', 'short'
  ];
  
  const hasKeyword = predictionKeywords.some(keyword => 
    tweet.text?.toLowerCase().includes(keyword)
  );
  
  return hasCryptoSymbol && (hasPrice || hasKeyword);
};

export const usePredictions = (tweets: Tweet[] = []) => {
  return useQuery({
    queryKey: ["predictions", tweets.map(t => t.tweet_id)],
    queryFn: async () => {
      console.log("Analyzing tweets for predictions...");
      return tweets.filter(isPredictionTweet).map(tweet => ({
        tweet,
        details: {
          crypto: tweet.text?.match(/\$[A-Z]+/)?.[0],
          priceAtPrediction: null,
          targetPrice: tweet.text?.match(/\$?\d+(?:,\d{3})*(?:\.\d+)?k?\s*(?:USD)?/i)?.[0],
          timeframe: null
        }
      }));
    },
    enabled: tweets.length > 0,
    retry: 1
  });
};