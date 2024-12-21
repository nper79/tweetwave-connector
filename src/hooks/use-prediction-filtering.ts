import { useEffect, useState } from "react";
import { Tweet } from "@/types/twitter";
import { isPredictionTweet } from "@/utils/prediction-utils";

export const usePredictionFiltering = (tweets: Tweet[] | undefined) => {
  const [predictionsFromTweets, setPredictionsFromTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    const filterPredictions = async () => {
      if (!tweets) return;
      
      const validTweets = tweets.filter((tweet): tweet is Tweet => Boolean(tweet));
      const predictions = [];
      
      for (const tweet of validTweets) {
        const isPrediction = await isPredictionTweet(tweet);
        if (isPrediction) {
          predictions.push(tweet);
        }
      }
      
      setPredictionsFromTweets(predictions.slice(0, 3));
    };

    filterPredictions();
  }, [tweets]);

  return predictionsFromTweets;
};