import { supabase } from "@/integrations/supabase/client";

const formatCryptoSymbol = (symbol: string): string | null => {
  if (!symbol) return null;
  // Remove $ if present and convert to uppercase
  return symbol.replace('$', '').toUpperCase();
};

export const fetchPriceFromDB = async (symbol: string): Promise<number | null> => {
  try {
    console.log(`Fetching latest price from DB for ${symbol}...`);
    
    const { data, error } = await supabase
      .from('historical_prices')
      .select('price, timestamp')
      .eq('symbol', symbol)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error(`DB error for ${symbol}:`, error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`No price found in DB for ${symbol}`);
      return null;
    }

    console.log(`Latest DB price for ${symbol}:`, data[0].price);
    return Number(data[0].price);
  } catch (error) {
    console.error(`Error fetching price from DB for ${symbol}:`, error);
    return null;
  }
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol} at ${new Date(timestamp).toISOString()}...`);
    
    const { data, error } = await supabase
      .from('historical_prices')
      .select('price')
      .eq('symbol', symbol)
      .gte('timestamp', new Date(timestamp - 24 * 60 * 60 * 1000).toISOString())
      .lte('timestamp', new Date(timestamp + 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: true })
      .limit(1);

    if (error) {
      console.error(`Historical price DB error for ${symbol}:`, error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`No historical price found for ${symbol}`);
      return null;
    }

    console.log(`Found historical price for ${symbol}:`, data[0].price);
    return Number(data[0].price);
  } catch (error) {
    console.error(`Error fetching historical price for ${symbol}:`, error);
    return null;
  }
};

export const fetchCryptoPrice = async (symbol: string): Promise<number | null> => {
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) {
      console.error('Invalid symbol format:', symbol);
      return null;
    }
    
    console.log(`Initiating price fetch for ${formattedSymbol}...`);
    
    // First try to get fresh data
    console.log(`Invoking edge function for ${formattedSymbol}...`);
    const { data: invocationData, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [formattedSymbol] }
    });

    if (invocationError) {
      console.error(`Edge function error for ${formattedSymbol}:`, invocationError);
      // Try to get the latest price from DB as fallback
      console.log(`Attempting DB fallback for ${formattedSymbol}...`);
      const latestPrice = await fetchPriceFromDB(formattedSymbol);
      if (latestPrice) {
        console.log(`Successfully retrieved fallback price for ${formattedSymbol}:`, latestPrice);
        return latestPrice;
      }
      console.error(`No fallback price found for ${formattedSymbol}`);
      return null;
    }

    console.log(`Edge function response for ${formattedSymbol}:`, invocationData);

    // Get the latest price after fetching fresh data
    const latestPrice = await fetchPriceFromDB(formattedSymbol);
    if (latestPrice) {
      console.log(`Successfully fetched current price for ${formattedSymbol}:`, latestPrice);
      return latestPrice;
    }

    console.error(`No price found for ${formattedSymbol} after all attempts`);
    return null;
  } catch (error) {
    console.error(`Unexpected error fetching price for ${symbol}:`, error);
    return null;
  }
};