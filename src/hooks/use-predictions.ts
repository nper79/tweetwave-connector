import { useQuery } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { analyzeTweetForPrediction, extractPredictionDetails } from "@/utils/deepseek";

export const usePredictions = (tweets: Tweet[] = [], apiKey: string) => {
  return useQuery({
    queryKey: ["predictions", tweets.map(t => t.tweet_id)],
    queryFn: async () => {
      const predictions = [];
      
      for (const tweet of tweets) {
        const isPrediction = await analyzeTweetForPrediction(tweet, apiKey);
        
        if (isPrediction) {
          const details = await extractPredictionDetails(tweet, apiKey);
          if (details) {
            predictions.push({
              tweet,
              details
            });
          }
        }
      }
      
      return predictions;
    },
    enabled: tweets.length > 0 && !!apiKey
  });
};