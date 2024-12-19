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

const RAPID_API_KEY = "d51b9a68c9mshdf25f4ca2622a18p1602edjsn81602d153c16";
const RAPID_API_HOST = "crypto-price-by-api-ninjas.p.rapidapi.com";

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
        // Format the symbol as LTCBTC format (assuming BTC as base)
        const symbol = `${code.toUpperCase()}BTC`;
        console.log("Fetching price for symbol:", symbol);

        const response = await fetch(
          `https://${RAPID_API_HOST}/v1/cryptoprice?symbol=${symbol}`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': RAPID_API_KEY,
              'X-RapidAPI-Host': RAPID_API_HOST
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

        // Transform the API response to match our expected format
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
          history: generateHistoryFromPrice(priceData.price, start, end)
        };

        return mockData;
      } catch (error) {
        console.error("API Error:", error);
        toast.error("Failed to fetch price data, using simulated data");
        
        // Fallback to mock data in case of API failure
        return {
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
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Helper function to generate history data from a single price point
const generateHistoryFromPrice = (currentPrice: number, start: number, end: number): CoinHistory[] => {
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((end - start) / dayMs);
  const volatility = 0.02; // 2% daily volatility

  return Array.from({ length: days }, (_, i) => {
    const date = start + i * dayMs;
    const randomChange = 1 + (Math.random() - 0.5) * volatility;
    const rate = currentPrice * randomChange;
    return {
      date,
      rate,
      volume: 25000000000 + Math.random() * 5000000000,
      cap: rate * 19600000 // Approximate market cap based on current supply
    };
  });
};

// Fallback mock data generator
const generateMockHistoryData = (start: number, end: number): CoinHistory[] => {
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((end - start) / dayMs);
  
  return Array.from({ length: days }, (_, i) => ({
    date: start + i * dayMs,
    rate: 42000 + Math.random() * 2000,
    volume: 25000000000 + Math.random() * 5000000000,
    cap: 800000000000 + Math.random() * 40000000000
  }));
};

// Utility function to calculate ROI
export const calculateROI = (entryPrice: number, currentPrice: number): number => {
  return ((currentPrice - entryPrice) / entryPrice) * 100;
};
