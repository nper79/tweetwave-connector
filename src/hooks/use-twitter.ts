import { useQuery } from "@tanstack/react-query";
import { TwitterResponse, Tweet } from "@/types/twitter";
import { toast } from "sonner";

const RAPID_API_KEY = "d51b9a68c9mshdf25f4ca2622a18p1602edjsn81602d153c16";
const RAPID_API_HOST = "twitter-api45.p.rapidapi.com";

export const useTwitterTimeline = () => {
  return useQuery({
    queryKey: ["twitter-timeline"],
    queryFn: async (): Promise<Tweet[]> => {
      try {
        const response = await fetch(
          "https://twitter-api45.p.rapidapi.com/replies.php",
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': RAPID_API_KEY,
              'x-rapidapi-host': RAPID_API_HOST,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tweets");
        }

        const data: TwitterResponse = await response.json();
        console.log("Raw API response:", data);

        if (!data.timeline || !Array.isArray(data.timeline)) {
          console.error("Unexpected API response format:", data);
          return [];
        }

        return data.timeline;
      } catch (error) {
        console.error("Twitter API Error:", error);
        toast.error("Failed to fetch tweets");
        throw error;
      }
    },
  });
};