import { supabase } from "@/integrations/supabase/client";
import { fetchPriceFromDB } from "./price-utils";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace(/^\$/, '').replace(/USDT$/i, '').toUpperCase();
  return cleanCode;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;
    
    // First try to get from DB with a wider time window
    const startTime = new Date(timestamp - 48 * 60 * 60 * 1000); // 48h before
    const endTime = new Date(timestamp + 48 * 60 * 60 * 1000);   // 48h after
    
    const { data: prices, error } = await supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', formattedSymbol)
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching historical price:', error);
      return null;
    }

    if (prices && prices.length > 0) {
      return prices[0].price;
    }

    // If no price in DB, fetch fresh data
    const { data: invocationData, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [formattedSymbol] }
    });

    if (invocationError) {
      console.error('Error invoking edge function:', invocationError);
      return null;
    }

    // Try to get the price again after fetching fresh data
    const freshPrice = await fetchPriceFromDB(formattedSymbol, timestamp);
    return freshPrice;
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
    
    // Always fetch fresh data first
    const { data: invocationData, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [formattedSymbol] }
    });

    if (invocationError) {
      console.error('Error invoking edge function:', invocationError);
      // Try to get the latest price from DB as fallback
      return await fetchPriceFromDB(formattedSymbol);
    }

    // Get the latest price after fetching fresh data
    const latestPrice = await fetchPriceFromDB(formattedSymbol);
    if (latestPrice) return latestPrice;

    console.error(`No price found for ${symbol} after multiple attempts`);
    return null;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};