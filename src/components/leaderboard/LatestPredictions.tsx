import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Target, Clock } from "lucide-react";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { Skeleton } from "@/components/ui/skeleton";
import { Tweet } from "@/types/twitter";
import { formatDistanceToNow } from "date-fns";
import { isPredictionTweet } from "@/utils/prediction-utils";
import { useEffect, useState } from "react";

export const LatestPredictions = () => {
  const { data: tweets, isLoading, error } = useTwitterTimeline("SolbergInvest");
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

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Latest Predictions
          </CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-md bg-gray-50 dark:bg-gray-900">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Latest Predictions
          </CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            Failed to load predictions: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" />
          Latest Predictions
        </CardTitle>
        <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictionsFromTweets.map((tweet) => (
            <div key={tweet.tweet_id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">{tweet.text}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
                <a
                  href={`https://twitter.com/SolbergInvest/status/${tweet.tweet_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-indigo-500 transition-colors ml-auto"
                >
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
          {predictionsFromTweets.length === 0 && (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">
              No predictions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};