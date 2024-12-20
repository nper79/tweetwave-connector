import { supabase } from "@/integrations/supabase/client";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace('$', '');
  return cleanCode;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol}`);
    const { data, error } = await supabase.functions.invoke('get-crypto-prices', {
      body: { symbol: formatCryptoSymbol(symbol) }
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