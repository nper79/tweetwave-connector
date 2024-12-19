import { useQuery } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { analyzeTweetForPrediction, extractPredictionDetails } from "@/utils/deepseek";
import { toast } from "sonner";

export const usePredictions = (tweets: Tweet[] = [], apiKey: string) => {
  return useQuery({
    queryKey: ["predictions", tweets.map(t => t.tweet_id)],
    queryFn: async () => {
      if (!apiKey) {
        toast.error("DeepSeek API key is required");
        return [];
      }

      console.log("Analyzing tweets for predictions...");
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
    enabled: tweets.length > 0 && !!apiKey,
    retry: 1
  });
};