import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface PriceHistoryParams {
  currency?: string;
  symbol: string;
  start: number;
  end: number;
}

interface PriceHistoryResponse {
  history: {
    date: number;
    rate: number;
  }[];
}

export const usePriceHistory = ({ currency = "USD", symbol, start, end }: PriceHistoryParams) => {
  return useQuery({
    queryKey: ["price-history", symbol, start, end],
    queryFn: async (): Promise<PriceHistoryResponse> => {
      try {
        const response = await fetch("https://api.livecoinwatch.com/coins/single/history", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": "a91bacc5-9ae1-4ea5-8f11-b764775a2671",
          },
          body: JSON.stringify({
            currency,
            symbol,
            start,
            end,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch price history");
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