import { supabase } from "@/integrations/supabase/client";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace('$', '');
  return cleanCode;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol}`);
    
    // First try to get the price from our database
    const { data: prices, error: dbError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', formatCryptoSymbol(symbol))
      .order('timestamp', { ascending: true });

    if (dbError) throw dbError;

    if (prices && prices.length > 0) {
      // Find the closest historical price to the timestamp
      const targetDate = new Date(timestamp).getTime();
      const closestPrice = prices.reduce((closest, current) => {
        const currentDiff = Math.abs(new Date(current.timestamp).getTime() - targetDate);
        const closestDiff = Math.abs(new Date(closest.timestamp).getTime() - targetDate);
        return currentDiff < closestDiff ? current : closest;
      });

      return closestPrice.price;
    }

    // If no prices in database, fetch from Edge Function
    const { data, error } = await supabase.functions.invoke('get-crypto-prices', {
      body: { 
        symbol: formatCryptoSymbol(symbol),
        start: new Date(timestamp - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(timestamp + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      return null;
    }

    if (!data || !data.history || !data.history.length) {
      console.error('No historical data found');
      return null;
    }

    // Find the closest historical price to the timestamp
    const targetDate = new Date(timestamp).getTime();
    const closestPrice = data.history.reduce((closest: any, current: any) => {
      const currentDiff = Math.abs(current.date - targetDate);
      const closestDiff = Math.abs(closest.date - targetDate);
      return currentDiff < closestDiff ? current : closest;
    });

    return closestPrice.rate;
  } catch (error) {
    console.error('Error fetching historical price:', error);
    return null;
  }
};

export const fetchCryptoPrice = async (symbol: string | null): Promise<number | null> => {
  if (!symbol) return null;
  
  try {
    // First try to get the most recent price from our database
    const { data: prices, error: dbError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', formatCryptoSymbol(symbol))
      .order('timestamp', { ascending: false })
      .limit(1);

    if (dbError) throw dbError;

    // If we have a recent price (less than 1 hour old), use it
    if (prices && prices.length > 0) {
      const price = prices[0];
      const priceAge = Date.now() - new Date(price.timestamp).getTime();
      if (priceAge < 60 * 60 * 1000) { // 1 hour
        return price.price;
      }
    }

    // Otherwise fetch fresh data
    const { data, error } = await supabase.functions.invoke('get-crypto-prices', {
      body: { symbol: formatCryptoSymbol(symbol) }
    });

    if (error) {
      console.error('Edge Function error:', error);
      return null;
    }

    if (!data || !data.rate) {
      console.error('No price data found');
      return null;
    }

    return data.rate;
  } catch (error) {
    console.error('Failed to fetch price:', error);
    return null;
  }
};
