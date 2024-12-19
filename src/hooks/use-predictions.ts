import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";

const extractCryptoSymbol = (text: string): string | null => {
  const match = text.match(/\$[A-Z]{2,}/);
  return match ? match[0].substring(1) : null;
};

const extractTargetPrice = (text: string): number | null => {
  const match = text.match(/target:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ''));
};

const getCurrentPrice = async (crypto: string): Promise<number> => {
  // For now, return a mock price. In production, this should call a crypto price API
  return 50000; // Mock price
};

const isPredictionTweet = (tweet: Tweet) => {
  if (!tweet.text) return false;
  
  const cryptoSymbolRegex = /\$[A-Z]{2,}/;
  const hasCryptoSymbol = cryptoSymbolRegex.test(tweet.text);
  
  const predictionKeywords = [
    'target', 'prediction', 'predict', 'forecast',
    'expecting', 'expect', 'projected', 'analysis',
    'breakout', 'resistance', 'support', 'rally',
    'bullish', 'bearish', 'long', 'short'
  ];
  
  const hasKeyword = predictionKeywords.some(keyword => 
    tweet.text?.toLowerCase().includes(keyword)
  );
  
  return hasCryptoSymbol && hasKeyword;
};

export const usePredictions = (tweets: Tweet[] = []) => {
  const queryClient = useQueryClient();

  const storePrediction = async (tweet: Tweet) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to store predictions');

    const crypto = extractCryptoSymbol(tweet.text || '');
    if (!crypto) throw new Error('No crypto symbol found in tweet');

    const currentPrice = await getCurrentPrice(crypto);
    const targetPrice = extractTargetPrice(tweet.text || '');

    const { data, error } = await supabase
      .from('predictions')
      .upsert({
        user_id: user.id,
        crypto,
        price_at_prediction: currentPrice,
        target_price: targetPrice,
        tweet_id: tweet.tweet_id,
        tweet_text: tweet.text
      }, {
        onConflict: 'tweet_id'
      });

    if (error) throw error;
    return data;
  };

  // Store predictions mutation
  const storePredictionMutation = useMutation({
    mutationFn: storePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });

  // Query for predictions
  const predictionsQuery = useQuery({
    queryKey: ['predictions', tweets.map(t => t.tweet_id)],
    queryFn: async () => {
      console.log("Analyzing tweets for predictions...");
      const predictionTweets = tweets.filter(isPredictionTweet);
      
      // Store new predictions
      for (const tweet of predictionTweets) {
        try {
          await storePredictionMutation.mutateAsync(tweet);
        } catch (error) {
          console.error('Error storing prediction:', error);
        }
      }

      // Fetch all stored predictions for the tweets
      const { data: storedPredictions, error } = await supabase
        .from('predictions')
        .select('*')
        .in('tweet_id', predictionTweets.map(t => t.tweet_id));

      if (error) throw error;

      return storedPredictions.map(prediction => ({
        prediction,
        tweet: tweets.find(t => t.tweet_id === prediction.tweet_id)
      }));
    },
    enabled: tweets.length > 0,
  });

  return predictionsQuery;
};