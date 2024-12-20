import { supabase } from "@/integrations/supabase/client";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace('$', '').toUpperCase();
  return cleanCode;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol}`);
    
    const { data: prices, error: dbError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', formatCryptoSymbol(symbol))
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
    
    const { data: prices, error: dbError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', formatCryptoSymbol(symbol))
      .order('timestamp', { ascending: false })
      .limit(1);

    if (dbError) {
      console.error('Database error when fetching price:', dbError);
      throw dbError;
    }

    if (prices && prices.length > 0) {
      const price = prices[0];
      console.log(`Found price for ${symbol}:`, price.price);
      return price.price;
    }

    console.log(`No price found in database for ${symbol}`);
    
    // Try to invoke the edge function to fetch fresh prices
    const { error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [symbol] }
    });

    if (invocationError) {
      console.error('Error invoking edge function:', invocationError);
      throw invocationError;
    }

    // Try to get the price again after the edge function has run
    const { data: freshPrices, error: freshError } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', formatCryptoSymbol(symbol))
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

    return null;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};