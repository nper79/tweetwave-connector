import { useQuery } from "@tanstack/react-query";
import { TwitterResponse, Tweet } from "@/types/twitter";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useTwitterTimeline = (screenname: string = "elonmusk") => {
  return useQuery({
    queryKey: ["twitter-timeline", screenname],
    queryFn: async (): Promise<Tweet[]> => {
      try {
        console.log("Fetching tweets for:", screenname);
        
        const { data, error } = await supabase.functions.invoke('fetch-twitter-timeline', {
          body: { screenname }
        });

        if (error) {
          console.error("Edge Function Error:", error);
          toast.error("Failed to fetch tweets. Please try again later.");
          throw error;
        }

        if (!data || !data.timeline || !Array.isArray(data.timeline)) {
          console.error("Unexpected Twitter API response format:", data);
          toast.error("Invalid response format from Twitter API");
          throw new Error("Invalid response format from Twitter API");
        }

        // Log the successful response
        console.log("Successfully fetched tweets:", {
          count: data.timeline.length,
          firstTweet: data.timeline[0],
        });

        return data.timeline;
      } catch (error) {
        console.error("Twitter API Error:", error);
        toast.error("Failed to fetch tweets. Please try again later.");
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    gcTime: 60000
  });
};