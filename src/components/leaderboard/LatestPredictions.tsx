import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Target, Clock } from "lucide-react";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { Skeleton } from "@/components/ui/skeleton";
import { Tweet } from "@/types/twitter";
import { formatDistanceToNow } from "date-fns";
import { isPredictionTweet } from "@/utils/prediction-utils";

export const LatestPredictions = () => {
  const { data: tweets, isLoading, error } = useTwitterTimeline("SolbergInvest");

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

  const predictionsFromTweets = tweets?.filter(tweet => tweet && isPredictionTweet(tweet)).slice(0, 3);
  console.log('Filtered predictions:', predictionsFromTweets);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" />
          Latest Predictions
        </CardTitle>
        <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {!predictionsFromTweets || predictionsFromTweets.length === 0 ? (
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
            No predictions found
          </div>
        ) : (
          predictionsFromTweets.map((tweet: Tweet) => (
            tweet && (
              <div key={tweet.tweet_id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {tweet.author?.screen_name || "Unknown Author"}
                      {tweet.text?.toLowerCase().includes('$') && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-md">
                          {tweet.text.match(/\$[A-Z]+/)?.[0] || '$CRYPTO'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {tweet.text}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <a 
                    href={`https://twitter.com/${tweet.author?.screen_name}/status/${tweet.tweet_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer ml-2 flex-shrink-0" />
                  </a>
                </div>
              </div>
            )
          ))
        )}
      </CardContent>
    </Card>
  );
};