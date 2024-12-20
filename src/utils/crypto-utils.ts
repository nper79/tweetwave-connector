import ccxt from 'ccxt';

// Initialize Binance exchange in browser mode
const exchange = new ccxt.binance({
  enableRateLimit: true,
  options: {
    defaultType: 'spot',
    warnOnFetchOHLCVLimitArgument: false,
    createMarketBuyOrderRequiresPrice: false,
    fetchImplementation: async (url: string, options: RequestInit = {}, headers: Record<string, string> = {}) => {
      return fetch(url, { 
        ...options, 
        headers: { 
          ...headers, 
          ...(options.headers || {}),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        } 
      });
    },
  },
});

// Force 'cors' mode for browser environment
exchange.headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  
  // Remove any $ prefix if present
  const cleanCode = code.replace('$', '');
  
  // Map common symbols to their CCXT-compatible format
  const symbolMap: { [key: string]: string } = {
    'BTC': 'BTC/USDT',
    'ETH': 'ETH/USDT',
    'SOL': 'SOL/USDT',
    'ORAI': 'ORAI/USDT',
    'HBAR': 'HBAR/USDT',
    'FIL': 'FIL/USDT',
    'LDO': 'LDO/USDT',
  };

  return symbolMap[cleanCode] || `${cleanCode}/USDT`;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;

    console.log(`Fetching historical price for ${formattedSymbol} at ${new Date(timestamp).toISOString()}`);

    // CCXT requires timestamp in milliseconds
    const since = timestamp - 300000; // 5 minutes before
    const limit = 10; // Number of candles to fetch

    const ohlcv = await exchange.fetchOHLCV(
      formattedSymbol,
      '1m', // 1-minute timeframe
      since,
      limit
    );

    if (!ohlcv || ohlcv.length === 0) {
      console.error(`No historical price data found for ${symbol} at ${new Date(timestamp).toISOString()}`);
      return null;
    }

    // Find the closest candle to the target timestamp
    const targetCandle = ohlcv.reduce((prev, curr) => {
      return Math.abs(curr[0] - timestamp) < Math.abs(prev[0] - timestamp) ? curr : prev;
    });

    // Return the closing price of the closest candle
    return targetCandle[4];
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
    
    const ticker = await exchange.fetchTicker(formattedSymbol);
    
    if (!ticker || typeof ticker.last !== 'number') {
      console.error(`Invalid price data received for ${symbol}:`, ticker);
      return null;
    }
    
    return ticker.last;
  } catch (error) {
    console.error(`Failed to fetch current price for ${symbol}:`, error);
    return null;
  }
};