import { supabase } from "@/integrations/supabase/client";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace('$', '');
  return `${cleanCode}/USD`;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol}`);
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
    console.log('Making test call to Edge Function');
    
    const { data, error } = await supabase.functions.invoke('get-crypto-prices');

    if (error) {
      console.error('Edge Function test call failed:', error);
      return null;
    }

    console.log('Edge Function response:', data);

    // For testing, we'll return the hardcoded BTC price if it exists
    if (data && data['BTC/USD']) {
      return data['BTC/USD'].price;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch test price:', error);
    return null;
  }
};