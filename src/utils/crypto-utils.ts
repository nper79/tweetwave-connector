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
    'HBAR': 'HBAR',
    'FIL': 'FIL',
    // Add more mappings as needed
  };

  return symbolMap[cleanCode] || cleanCode;
};

interface HistoricalPriceResponse {
  history: Array<{
    date: number;
    rate: number;
  }>;
}

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    const { data: { secret: apiKey } } = await supabase.functions.invoke('get-secret-value', {
      body: { name: 'LIVECOINWATCH_API_KEY' }
    });

    if (!apiKey) {
      console.error('LiveCoinWatch API key not found');
      return null;
    }

    const response = await fetch("https://api.livecoinwatch.com/coins/single/history", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        currency: "USD",
        code: symbol,
        start: timestamp - 300000, // 5 minutes before
        end: timestamp + 300000,   // 5 minutes after
        meta: true,
      }),
    });

    if (!response.ok) {
      console.error(`Error fetching historical price for ${symbol}:`, response.statusText);
      return null;
    }

    const data: HistoricalPriceResponse = await response.json();
    
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