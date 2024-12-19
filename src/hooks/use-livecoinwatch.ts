import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface PriceHistoryParams {
  currency?: string;
  coin: string;
  start: number;
  end: number;
}

interface PriceHistoryResponse {
  history: {
    date: number;
    rate: number;
  }[];
}

export const usePriceHistory = ({ currency = "USD", coin, start, end }: PriceHistoryParams) => {
  return useQuery({
    queryKey: ["price-history", coin, start, end],
    queryFn: async (): Promise<PriceHistoryResponse> => {
      try {
        const response = await fetch("https://api.livecoinwatch.com/overview/history", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": "a91bacc5-9ae1-4ea5-8f11-b764775a2671",
          },
          body: JSON.stringify({
            currency,
            start,
            end,
            meta: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("LiveCoinWatch API Error:", errorData);
          throw new Error(errorData.error?.description || "Failed to fetch price history");
        }

        const data = await response.json();
        console.log("Price history data:", data);
        return data;
      } catch (error) {
        console.error("LiveCoinWatch API Error:", error);
        toast.error("Failed to fetch price history");
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Utility function to calculate ROI
export const calculateROI = (entryPrice: number, currentPrice: number): number => {
  return ((currentPrice - entryPrice) / entryPrice) * 100;
};