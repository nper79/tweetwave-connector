export const calculateROI = (entryPrice: number, currentPrice: number): number => {
  return ((currentPrice - entryPrice) / entryPrice) * 100;
};

export const formatCryptoSymbol = (code: string): string => {
  return `${code.toUpperCase()}USD`;
};

export const API_CONFIG = {
  RAPID_API_KEY: "d51b9a68c9mshdf25f4ca2622a18p1602edjsn81602d153c16",
  RAPID_API_HOST: "crypto-price-by-api-ninjas.p.rapidapi.com",
};