import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";
import { isPredictionTweet, extractCryptoSymbol, extractTargetPrice } from "@/utils/prediction-utils";

const getCurrentPrice = async (crypto: string): Promise<number> => {
  return 50000; // Mock price for testing
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