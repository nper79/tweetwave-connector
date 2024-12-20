import { supabase } from "@/integrations/supabase/client";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace('$', '').toUpperCase();
  return `${cleanCode}USDT`; // Always append USDT to match Binance format
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol}`);
    
    const formattedSymbol = formatCryptoSymbol(symbol);
    console.log('Formatted symbol:', formattedSymbol);
    
    const { data: prices, error: dbError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', symbol) // Use original symbol for historical prices
      .gte('timestamp', new Date(timestamp - 24 * 60 * 60 * 1000).toISOString())
      .lte('timestamp', new Date(timestamp + 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (prices && prices.length > 0) {
      const targetDate = new Date(timestamp).getTime();
      const closestPrice = prices.reduce((closest, current) => {
        const currentDiff = Math.abs(new Date(current.timestamp).getTime() - targetDate);
        const closestDiff = Math.abs(new Date(closest.timestamp).getTime() - targetDate);
        return currentDiff < closestDiff ? current : closest;
      });

      console.log(`Found historical price for ${symbol}:`, closestPrice.price);
      return closestPrice.price;
    }

    console.log('No historical price found in database');
    return null;
  } catch (error) {
    console.error('Error fetching historical price:', error);
    return null;
  }
};

export const fetchCryptoPrice = async (symbol: string | null): Promise<number | null> => {
  if (!symbol) return null;
  
  try {
    console.log(`Fetching current price for ${symbol}...`);
    const formattedSymbol = formatCryptoSymbol(symbol);
    console.log('Formatted symbol for price fetch:', formattedSymbol);
    
    // First try to get the latest price from the database
    const { data: prices, error: dbError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', symbol) // Use original symbol for querying
      .order('timestamp', { ascending: false })
      .limit(1);

    if (dbError) {
      console.error('Error fetching price:', dbError);
      throw dbError;
    }

    // If we have a recent price (less than 30 seconds old), use it
    if (prices && prices.length > 0) {
      const price = prices[0];
      const priceAge = Date.now() - new Date(price.timestamp).getTime();
      if (priceAge < 30000) { // 30 seconds
        console.log(`Found recent price for ${symbol}:`, price.price);
        return price.price;
      }
    }

    // If we don't have a recent price, fetch fresh data
    console.log(`Fetching fresh price for ${symbol}...`);
    const { data, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [symbol] }
    });

    if (invocationError) {
      console.error('Error invoking edge function:', invocationError);
      throw invocationError;
    }

    // Get the latest price after fetching fresh data
    const { data: freshPrices, error: freshError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', symbol)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (freshError) {
      console.error('Error fetching fresh price:', freshError);
      throw freshError;
    }

    if (freshPrices && freshPrices.length > 0) {
      console.log(`Found fresh price for ${symbol}:`, freshPrices[0].price);
      return freshPrices[0].price;
    }

    console.log(`No price found for ${symbol}`);
    return null;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};