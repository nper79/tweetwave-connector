import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface CoinHistory {
  date: number;
  rate: number;
  volume: number;
  cap: number;
}

interface CoinHistoryResponse {
  code: string;
  name: string;
  symbol: string;
  rank: number;
  age: number;
  color: string;
  png32: string;
  png64: string;
  webp32: string;
  webp64: string;
  exchanges: number;
  markets: number;
  pairs: number;
  allTimeHighUSD: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number;
  categories: string[];
  history: CoinHistory[];
}

interface PriceHistoryParams {
  code?: string;
  currency?: string;
  start: number;
  end: number;
  meta?: boolean;
}

export const usePriceHistory = ({ code = "BTC", currency = "USD", start, end, meta = true }: PriceHistoryParams) => {
  return useQuery({
    queryKey: ["price-history", code, currency, start, end],
    queryFn: async (): Promise<CoinHistoryResponse> => {
      try {
        const request = new Request("https://api.livecoinwatch.com/coins/single/history", {
          method: "POST",
          headers: new Headers({
            "content-type": "application/json",
            "x-api-key": "a91bacc5-9ae1-4ea5-8f11-b764775a2671",
          }),
          body: JSON.stringify({
            code,
            currency,
            start,
            end,
            meta,
          }),
        });

        const response = await fetch(request);

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