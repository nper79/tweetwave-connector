import { CoinHistoryResponse } from "../types/crypto";

export const generateHistoryFromPrice = (currentPrice: number, start: number, end: number) => {
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
      cap: rate * 19600000
    };
  });
};

export const generateMockHistoryData = (start: number, end: number) => {
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((end - start) / dayMs);
  
  return Array.from({ length: days }, (_, i) => ({
    date: start + i * dayMs,
    rate: 42000 + Math.random() * 2000,
    volume: 25000000000 + Math.random() * 5000000000,
    cap: 800000000000 + Math.random() * 40000000000
  }));
};

export const generateMockCoinData = (code: string): Omit<CoinHistoryResponse, 'history'> => ({
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
  categories: ["cryptocurrency"]
});