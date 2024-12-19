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

// Mock data generator function
const generateMockHistoryData = (start: number, end: number): CoinHistory[] => {
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((end - start) / dayMs);
  
  return Array.from({ length: days }, (_, i) => ({
    date: start + i * dayMs,
    rate: 42000 + Math.random() * 2000, // Random price between 42000-44000
    volume: 25000000000 + Math.random() * 5000000000,
    cap: 800000000000 + Math.random() * 40000000000
  }));
};

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
      // Generate mock data
      const mockData: CoinHistoryResponse = {
        code: code,
        name: code === "BTC" ? "Bitcoin" : code,
        symbol: code === "BTC" ? "₿" : code,
        rank: 1,
        age: 4810,
        color: "#fa9e32",
        png32: "https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/32/btc.png",
        png64: "https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/btc.png",
        webp32: "https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/32/btc.webp",
        webp64: "https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/btc.webp",
        exchanges: 145,
        markets: 4180,
        pairs: 1524,
        allTimeHighUSD: 69000,
        circulatingSupply: 19600000,
        totalSupply: null,
        maxSupply: 21000000,
        categories: ["cryptocurrency"],
        history: generateMockHistoryData(start, end)
      };

      // Show toast to inform users we're using mock data
      toast.info("Using simulated price data for demonstration");
      
      return mockData;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Utility function to calculate ROI
export const calculateROI = (entryPrice: number, currentPrice: number): number => {
  return ((currentPrice - entryPrice) / entryPrice) * 100;
};