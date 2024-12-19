import { Tweet } from "@/types/twitter";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { usePredictions } from "@/hooks/use-predictions";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MessageCircle, Heart, Repeat2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface TwitterTimelineProps {
  username?: string;
}

export const TwitterTimeline = ({ username = "elonmusk" }: TwitterTimelineProps) => {
  const { data: tweets, isLoading, error } = useTwitterTimeline(username);
  const { data: predictions } = usePredictions(tweets);

  console.log("Predictions:", predictions);

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
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Failed to load tweets: {error.message}</p>
      </div>
    );
  }

  if (!tweets || tweets.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No tweets found for @{username}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets?.map((tweet: Tweet) => {
        if (!tweet || !tweet.author) {
          console.warn("Invalid tweet data:", tweet);
          return null;
        }

        const hasMedia = tweet.media?.photo && tweet.media.photo[0];
        const isPrediction = predictions?.some(p => p.tweet.tweet_id === tweet.tweet_id);

        return (
          <div
            key={tweet.tweet_id}
            className={`p-4 border rounded-lg hover:border-blue-400 transition-colors bg-white shadow-sm ${
              isPrediction ? 'border-green-400' : ''
            }`}
          >
            <div className="flex items-start space-x-3 mb-2">
              {tweet.author.avatar && (
                <img
                  src={tweet.author.avatar}
                  alt={tweet.author.name || "Author"}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{tweet.author.name || "Unknown Author"}</p>
                <p className="text-gray-500">@{tweet.author.screen_name || username}</p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <p className="text-gray-900 whitespace-pre-wrap">{tweet.text}</p>
              </div>
              
              {hasMedia && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex-shrink-0 w-64 cursor-pointer">
                      <img
                        src={tweet.media.photo[0].media_url_https}
                        alt="Tweet media"
                        className="rounded-lg object-cover w-full h-full max-h-48"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <img
                      src={tweet.media.photo[0].media_url_https}
                      alt="Tweet media"
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>{tweet.replies || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Repeat2 className="h-4 w-4" />
                <span>{tweet.retweets || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>{tweet.favorites || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>{tweet.views || 0}</span>
              </div>
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                <time dateTime={tweet.created_at}>
                  {new Date(tweet.created_at).toLocaleDateString()}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};