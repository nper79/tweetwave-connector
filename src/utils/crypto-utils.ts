const API_BASE_URL = "https://8394cea1-cd61-4ee4-a8e6-92a205cf7c17-00-3komcir7xic0l.riker.replit.dev";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  
  // Remove any $ prefix if present and add /USD suffix
  const cleanCode = code.replace('$', '');
  return `${cleanCode}/USD`;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;

    console.log(`Fetching historical price for ${formattedSymbol}`);
    
    // For now, we'll just fetch current price since historical data isn't available
    // in the free API. In production, you'd want to use a service with historical data
    const currentPrice = await fetchCryptoPrice(symbol);
    return currentPrice;
  } catch (error) {
    console.error('Error fetching historical price:', error);
    return null;
  }
};

export const fetchCryptoPrice = async (symbol: string | null): Promise<number | null> => {
  if (!symbol) return null;
  
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;
    
    console.log(`Fetching current price for symbol: ${formattedSymbol}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/prices?symbols=${formattedSymbol}&exchange=kraken`
    );

    if (!response.ok) {
      console.error('Failed to fetch current price:', await response.text());
      return null;
    }

    const data = await response.json();
    if (!data || !data[formattedSymbol]) {
      console.error('No price data found');
      return null;
    }

    return data[formattedSymbol].price;
  } catch (error) {
    console.error('Failed to fetch current price:', error);
    return null;
  }
};