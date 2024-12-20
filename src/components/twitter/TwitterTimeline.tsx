import { useTwitterTimeline } from "@/hooks/use-twitter";
import { usePredictions } from "@/hooks/use-predictions";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TweetCard } from "./TweetCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Tweet } from "@/types/twitter";

interface TwitterTimelineProps {
  username?: string;
}

export const TwitterTimeline = ({ username = "elonmusk" }: TwitterTimelineProps) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { data: tweets, isLoading, error, refetch } = useTwitterTimeline(username);
  const { data: predictions } = usePredictions(tweets || []);

  useEffect(() => {
    const initializeFetch = async () => {
      if (isInitialLoad && !tweets && !isLoading) {
        console.log('Initial fetch for:', username);
        try {
          await refetch();
        } catch (error) {
          console.error('Error during initial fetch:', error);
        } finally {
          setIsInitialLoad(false);
        }
      }
    };

    initializeFetch();
  }, [username, isInitialLoad, tweets, isLoading, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Twitter timeline error:', error);
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load tweets. Please try refreshing the page.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setIsInitialLoad(true);
              refetch();
            }}
            className="ml-2"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!tweets || tweets.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          No tweets found for @{username}
        </AlertDescription>
      </Alert>
    );
  }

  // Filter and prepare tweets
  const validTweets = tweets.filter((tweet): tweet is Tweet => 
    Boolean(tweet && tweet.created_at && tweet.tweet_id)
  );
  
  const sortedTweets = [...validTweets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Prepare prediction tweets
  const predictionTweets = predictions
    ?.map(p => p.tweet)
    .filter((tweet): tweet is Tweet => Boolean(tweet && tweet.created_at)) || [];
  
  const sortedPredictionTweets = [...predictionTweets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  console.log('Tweet counts:', {
    valid: validTweets.length,
    sorted: sortedTweets.length,
    predictions: sortedPredictionTweets.length
  });
  
  return (
    <Tabs defaultValue="predictions" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="predictions" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Predictions ({sortedPredictionTweets.length})
        </TabsTrigger>
        <TabsTrigger value="all">
          All Tweets ({sortedTweets.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="predictions" className="space-y-4">
        {sortedPredictionTweets.length === 0 ? (
          <div className="text-center p-4 border rounded-lg">
            <p className="text-gray-500">No prediction tweets found</p>
          </div>
        ) : (
          sortedPredictionTweets.map(tweet => (
            <TweetCard 
              key={tweet.tweet_id} 
              tweet={tweet} 
              isPrediction={true}
            />
          ))
        )}
      </TabsContent>
      <TabsContent value="all" className="space-y-4">
        {sortedTweets.map(tweet => (
          <TweetCard
            key={tweet.tweet_id}
            tweet={tweet}
            isPrediction={sortedPredictionTweets.some(p => p.tweet_id === tweet.tweet_id)}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
};