import { Tweet } from "@/types/twitter";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

export const TwitterTimeline = () => {
  const { data, isLoading, error } = useTwitterTimeline();

  console.log("Twitter API Response:", data); // Add logging to debug the response structure

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
        <p className="text-red-500">Failed to load tweets</p>
      </div>
    );
  }

  // Check if data exists and has the expected structure
  const tweets = data?.data || [];

  if (tweets.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No tweets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet: Tweet) => (
        <div
          key={tweet.id}
          className="p-4 border rounded-lg hover:border-blue-400 transition-colors bg-white shadow-sm"
        >
          <p className="text-gray-900 mb-2">{tweet.text}</p>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDays className="mr-2 h-4 w-4" />
            <time dateTime={tweet.created_at}>
              {new Date(tweet.created_at).toLocaleDateString()}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
};