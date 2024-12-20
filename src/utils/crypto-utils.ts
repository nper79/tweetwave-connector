export const API_CONFIG = {
  RAPID_API_KEY: "d51b9a68c9mshdf25f4ca2622a18p1602edjsn81602d153c16",
  RAPID_API_HOST: "crypto-market-prices.p.rapidapi.com",
};

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  
  // Remove any $ prefix if present
  const cleanCode = code.replace('$', '');
  
  // Map common symbols to their API-compatible format
  const symbolMap: { [key: string]: string } = {
    'BTC': 'BTC',
    'ETH': 'ETH',
    'SOL': 'SOL',
    'ORAI': 'ORAI',
    // Add more mappings as needed
  };

  return symbolMap[cleanCode] || cleanCode;
};