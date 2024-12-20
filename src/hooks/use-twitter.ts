import { useQuery } from "@tanstack/react-query";
import { TwitterResponse, Tweet } from "@/types/twitter";
import { toast } from "sonner";

const RAPID_API_KEY = "d51b9a68c9mshdf25f4ca2622a18p1602edjsn81602d153c16";
const RAPID_API_HOST = "twitter-api45.p.rapidapi.com";

export const useTwitterTimeline = (screenname: string = "elonmusk") => {
  return useQuery({
    queryKey: ["twitter-timeline", screenname],
    queryFn: async (): Promise<Tweet[]> => {
      try {
        console.log("Fetching tweets for:", screenname);
        
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': RAPID_API_HOST,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store' as RequestCache
        };

        const response = await fetch(
          `https://${RAPID_API_HOST}/timeline.php?screenname=${screenname}`,
          options
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Twitter API Error Response:", errorText);
          throw new Error(`Failed to fetch tweets: ${response.status} ${response.statusText}`);
        }

        const data: TwitterResponse = await response.json();
        console.log("Raw Twitter API response:", data);

        if (!data.timeline || !Array.isArray(data.timeline)) {
          console.error("Unexpected Twitter API response format:", data);
          throw new Error("Invalid response format from Twitter API");
        }

        console.log("Successfully fetched tweets:", data.timeline.length);
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
    staleTime: 30000, // 30 seconds
    gcTime: 60000 // 1 minute (replaces cacheTime)
  });
};