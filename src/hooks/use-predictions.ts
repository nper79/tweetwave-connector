import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";

const extractCryptoSymbol = (text: string): string | null => {
  const match = text.match(/\$[A-Z]{2,}/);
  return match ? match[0].substring(1) : 'BTC'; // Default to BTC if no symbol found
};

const extractTargetPrice = (text: string): number | null => {
  // Look for explicit target prices
  const targetMatch = text.match(/target:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i);
  if (targetMatch) return parseFloat(targetMatch[1].replace(/,/g, ''));
  
  // Look for price levels or projections
  const priceMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (priceMatch) return parseFloat(priceMatch[1].replace(/,/g, ''));
  
  return 50000; // Default target price for testing
};

const getCurrentPrice = async (crypto: string): Promise<number> => {
  return 50000; // Mock price for testing
};

const isPredictionTweet = (tweet: Tweet): boolean => {
  if (!tweet.text) return false;
  
  const text = tweet.text.toLowerCase();
  
  // Keywords indicating a prediction
  const predictionKeywords = [
    'prediction', 'predict', 'target', 'expect', 'soon', 'coming',
    'dip', 'drop', 'fall', 'decline', 'bearish',
    'pump', 'rise', 'surge', 'bullish', 'moon',
    'support', 'resistance', 'break'
  ];
  
  // Check for crypto symbols
  const hasCryptoSymbol = text.includes('$') && /\$[A-Z]{2,}/.test(tweet.text);
  
  // Check for prediction keywords
  const hasPredictionKeyword = predictionKeywords.some(keyword => text.includes(keyword));
  
  // Check for technical analysis terms
  const hasTechnicalAnalysis = text.includes('wedge') || 
                              text.includes('pattern') || 
                              text.includes('trend') ||
                              text.includes('level') ||
                              text.includes('bottom');
  
  return hasCryptoSymbol && (hasPredictionKeyword || hasTechnicalAnalysis);
};

const parsePredictionFromTweet = (tweet: Tweet) => {
  if (!tweet.text) return null;
  
  return {
    crypto: extractCryptoSymbol(tweet.text),
    price_at_prediction: 50000, // Mock price for testing
    target_price: extractTargetPrice(tweet.text),
    tweet_id: tweet.tweet_id,
    tweet_text: tweet.text,
    prediction_date: tweet.created_at
  };
};

export const usePredictions = (tweets: Tweet[] = []) => {
  const queryClient = useQueryClient();

  const storePrediction = async (tweet: Tweet) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const prediction = parsePredictionFromTweet(tweet);
    if (!prediction) return null;

    const { data, error } = await supabase
      .from('predictions')
      .upsert({
        ...prediction,
        user_id: user.id,
      }, {
        onConflict: 'tweet_id'
      });

    if (error) throw error;
    return data;
  };

  const storePredictionMutation = useMutation({
    mutationFn: storePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });

  return useQuery({
    queryKey: ['predictions', tweets.map(t => t.tweet_id)],
    queryFn: async () => {
      console.log("Analyzing tweets for predictions...");
      const predictionTweets = tweets.filter(isPredictionTweet);
      console.log(`Found ${predictionTweets.length} prediction tweets`);
      
      for (const tweet of predictionTweets) {
        try {
          await storePredictionMutation.mutateAsync(tweet);
        } catch (error) {
          console.error('Error storing prediction:', error);
        }
      }

      return predictionTweets.map(tweet => {
        const prediction = parsePredictionFromTweet(tweet);
        return {
          prediction: prediction || {
            crypto: extractCryptoSymbol(tweet.text || ''),
            price_at_prediction: 50000,
            target_price: extractTargetPrice(tweet.text || ''),
            tweet_id: tweet.tweet_id,
            tweet_text: tweet.text,
            prediction_date: tweet.created_at
          },
          tweet
        };
      });
    },
    enabled: tweets.length > 0,
  });
};