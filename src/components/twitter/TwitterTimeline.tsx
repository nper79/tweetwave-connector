import { useTwitterTimeline } from "@/hooks/use-twitter";
import { usePredictions } from "@/hooks/use-predictions";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TweetCard } from "./TweetCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface TwitterTimelineProps {
  username?: string;
}

export const TwitterTimeline = ({ username = "elonmusk" }: TwitterTimelineProps) => {
  const { data: tweets, isLoading, error, refetch } = useTwitterTimeline(username);
  const { data: predictions } = usePredictions(tweets || []);

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      try {
        // Only refetch if we don't have data and we're not currently loading
        if (!isLoading && !tweets && mounted) {
          console.log('Initializing data fetch for:', username);
          await refetch();
        }
      } catch (error) {
        console.error('Error fetching tweets:', error);
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [tweets, isLoading, refetch, username]);

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
          <span>Failed to load tweets: {error.message}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
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

  // Ensure we have arrays to work with and create copies for sorting
  const tweetsToSort = Array.isArray(tweets) ? [...tweets].filter(tweet => tweet && tweet.created_at) : [];
  const predictionTweets = predictions?.map(p => p.tweet).filter(Boolean) || [];
  
  // Sort tweets by date (newest first)
  const sortedTweets = tweetsToSort.sort((a, b) => {
    if (!a?.created_at || !b?.created_at) return 0;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Sort prediction tweets by date (newest first)
  const sortedPredictionTweets = predictionTweets
    .filter(tweet => tweet && tweet.created_at)
    .sort((a, b) => {
      if (!a?.created_at || !b?.created_at) return 0;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  
  console.log('Original tweets length:', tweets.length);
  console.log('Sorted tweets length:', sortedTweets.length);
  console.log('Found prediction tweets:', sortedPredictionTweets.length);
  
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