import { fetchFromLiveCoinWatch } from "./livecoinwatch-api";

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
    'HBAR': 'HBAR',
    'FIL': 'FIL',
    'LDO': 'LDO',
    // Add more mappings as needed
  };

  return symbolMap[cleanCode] || cleanCode;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;

    console.log(`Fetching historical price for ${formattedSymbol} at ${new Date(timestamp).toISOString()}`);

    const data = await fetchFromLiveCoinWatch('coins/single/history', formattedSymbol, {
      start: timestamp - 300000, // 5 minutes before
      end: timestamp + 300000,   // 5 minutes after
    });
    
    if (!data.history || data.history.length === 0) {
      console.error(`No historical price data found for ${symbol} at ${new Date(timestamp).toISOString()}`);
      return null;
    }

    // Find the closest price to the target timestamp
    const closestPrice = data.history.reduce((prev, curr) => {
      return Math.abs(curr.date - timestamp) < Math.abs(prev.date - timestamp) ? curr : prev;
    });

    return closestPrice.rate;
  } catch (error) {
    console.error(`Failed to fetch historical price for ${symbol}:`, error);
    return null;
  }
};

export const fetchCryptoPrice = async (symbol: string | null): Promise<number | null> => {
  if (!symbol) return null;
  
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;
    
    console.log(`Fetching current price for symbol: ${formattedSymbol}`);
    
    const data = await fetchFromLiveCoinWatch('coins/single', formattedSymbol);
    return data.rate || null;
  } catch (error) {
    console.error(`Failed to fetch current price for ${symbol}:`, error);
    return null;
  }
};