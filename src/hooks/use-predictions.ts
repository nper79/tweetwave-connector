import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";
import { isPredictionTweet, extractCryptoSymbol, extractTargetPrice } from "@/utils/prediction-utils";

const getCurrentPrice = async (crypto: string): Promise<number> => {
  return 50000; // Mock price for testing
};

const parsePredictionFromTweet = async (tweet: Tweet) => {
  if (!tweet.text) return null;
  
  const isPrediction = await isPredictionTweet(tweet);
  if (!isPrediction) return null;

  const crypto = await extractCryptoSymbol(tweet.text, tweet);
  const targetPrice = await extractTargetPrice(tweet.text, tweet);
  
  if (!crypto || !targetPrice) {
    console.log('Missing crypto or target price for tweet:', tweet.text);
    return null;
  }
  
  return {
    crypto,
    price_at_prediction: 50000, // Mock price for testing
    target_price: targetPrice,
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

    const prediction = await parsePredictionFromTweet(tweet);
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
      const predictions = [];
      
      for (const tweet of tweets) {
        if (!tweet) continue;
        
        try {
          const prediction = await parsePredictionFromTweet(tweet);
          if (prediction) {
            await storePredictionMutation.mutateAsync(tweet);
            predictions.push({
              prediction,
              tweet
            });
          }
        } catch (error) {
          console.error('Error processing prediction:', error);
        }
      }

      console.log(`Found ${predictions.length} prediction tweets`);
      return predictions;
    },
    enabled: tweets.length > 0,
  });
};