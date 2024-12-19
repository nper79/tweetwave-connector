import { useQuery } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { analyzeTweetForPrediction, extractPredictionDetails } from "@/utils/deepseek";
import { toast } from "sonner";

export const usePredictions = (tweets: Tweet[] = []) => {
  return useQuery({
    queryKey: ["predictions", tweets.map(t => t.tweet_id)],
    queryFn: async () => {
      console.log("Analyzing tweets for predictions...");
      const predictions = [];
      
      for (const tweet of tweets) {
        const isPrediction = await analyzeTweetForPrediction(tweet);
        
        if (isPrediction) {
          const details = await extractPredictionDetails(tweet);
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
    enabled: tweets.length > 0,
    retry: 1
  });
};