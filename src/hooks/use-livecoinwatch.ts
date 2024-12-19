import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as ccxt from 'ccxt';

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

// Mock data for when API fails
const mockHistoryData: CoinHistoryResponse = {
  code: "BTC",
  name: "Bitcoin",
  symbol: "₿",
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
  history: Array.from({ length: 30 }, (_, i) => ({
    date: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
    rate: 42000 + Math.random() * 2000,
    volume: 25000000000 + Math.random() * 5000000000,
    cap: 800000000000 + Math.random() * 40000000000
  }))
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
      try {
        // Initialize Binance exchange (you can change this to any supported exchange)
        const exchange = new ccxt.binance();
        
        // Fetch OHLCV data (Open, High, Low, Close, Volume)
        const ohlcv = await exchange.fetchOHLCV(
          `${code}/${currency}`,
          '1d', // 1 day timeframe
          start,
          (end - start) / (24 * 60 * 60 * 1000) // Calculate number of days
        );

        // Transform OHLCV data to match our interface
        const history: CoinHistory[] = ohlcv.map(([timestamp, , , , close, volume]) => ({
          date: timestamp,
          rate: close,
          volume: volume,
          cap: close * (mockHistoryData.circulatingSupply || 19000000) // Approximate market cap
        }));

        // Return data in the expected format
        return {
          ...mockHistoryData, // Use mock data for static fields
          code,
          name: code,
          symbol: code,
          history
        };

      } catch (error) {
        console.error("CCXT API Error:", error);
        toast.error("Using mock data due to API unavailability");
        return mockHistoryData;
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