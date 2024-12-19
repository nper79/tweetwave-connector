import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CoinHistoryResponse } from "../types/crypto";
import { API_CONFIG, formatCryptoSymbol } from "../utils/crypto-utils";
import { 
  generateHistoryFromPrice, 
  generateMockHistoryData, 
  generateMockCoinData 
} from "../utils/crypto-mock-data";

export const usePriceHistory = ({ 
  code = "BTC", 
  currency = "USD", 
  start, 
  end, 
  meta = true 
}: {
  code?: string;
  currency?: string;
  start: number;
  end: number;
  meta?: boolean;
}) => {
  return useQuery({
    queryKey: ["price-history", code, currency, start, end],
    queryFn: async (): Promise<CoinHistoryResponse> => {
      try {
        const symbol = formatCryptoSymbol(code);
        console.log("Fetching price for symbol:", symbol);

        const response = await fetch(
          `https://${API_CONFIG.RAPID_API_HOST}/v1/cryptoprice?symbol=${symbol}`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': API_CONFIG.RAPID_API_KEY,
              'X-RapidAPI-Host': API_CONFIG.RAPID_API_HOST
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error Response:", errorData);
          throw new Error(errorData.error || "Failed to fetch price data");
        }

        const priceData = await response.json();
        console.log("API Response:", priceData);

        if (!priceData.price) {
          throw new Error("Invalid price data received");
        }

        // Combine mock metadata with real price data
        return {
          ...generateMockCoinData(code),
          history: generateHistoryFromPrice(priceData.price, start, end)
        };
      } catch (error) {
        console.error("API Error:", error);
        toast.error("Failed to fetch price data, using simulated data");
        
        // Fallback to complete mock data
        return {
          ...generateMockCoinData(code),
          history: generateMockHistoryData(start, end)
        };
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export { calculateROI } from "../utils/crypto-utils";