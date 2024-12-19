import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface PriceHistoryParams {
  currency?: string;
  start: number;
  end: number;
}

interface PriceHistoryResponse {
  history: {
    date: number;
    cap: number;
    volume: number;
    liquidity: number;
    btcDominance: number;
  }[];
}

export const usePriceHistory = ({ currency = "USD", start, end }: PriceHistoryParams) => {
  return useQuery({
    queryKey: ["price-history", currency, start, end],
    queryFn: async (): Promise<PriceHistoryResponse> => {
      try {
        const response = await fetch("https://api.livecoinwatch.com/overview/history", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "x-api-key": "a91bacc5-9ae1-4ea5-8f11-b764775a2671",
          },
          body: JSON.stringify({
            currency,
            start,
            end,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("LiveCoinWatch API Error Response:", errorData);
          throw new Error(errorData.error || "Failed to fetch price history");
        }

        const data = await response.json();
        console.log("Price history data:", data);
        return data;
      } catch (error) {
        console.error("LiveCoinWatch API Error:", error);
        toast.error("Failed to fetch market data. Please try again later.");
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