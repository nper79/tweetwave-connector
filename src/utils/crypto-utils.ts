export const API_CONFIG = {
  RAPID_API_KEY: "d51b9a68c9mshdf25f4ca2622a18p1602edjsn81602d153c16",
  RAPID_API_HOST: "crypto-price-by-api-ninjas.p.rapidapi.com",
};

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  
  // Remove any $ prefix if present
  const cleanCode = code.replace('$', '');
  
  // Map common symbols to their API-compatible format
  const symbolMap: { [key: string]: string } = {
    'BTC': 'BTCUSD',
    'ETH': 'ETHUSD',
    'SOL': 'SOLUSD',
    'ORAI': null, // Unsupported token
    // Add more mappings as needed
  };

  // Return mapped symbol or default format
  return symbolMap[cleanCode] || `${cleanCode}USD`;
};