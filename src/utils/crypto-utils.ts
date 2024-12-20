import { supabase } from "@/integrations/supabase/client";
import { fetchPriceFromDB } from "./price-utils";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace(/^\$/, '').replace(/USDT$/i, '').toUpperCase();
  return `${cleanCode}USDT`;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;
    
    // First try to get from DB
    const dbPrice = await fetchPriceFromDB(formattedSymbol, timestamp);
    if (dbPrice) return dbPrice;

    // If no price in DB, fetch fresh data
    const { data: invocationData, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [symbol] }
    });

    if (invocationError) throw invocationError;

    // Try to get the price again after fetching fresh data
    return await fetchPriceFromDB(formattedSymbol, timestamp);
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
    
    // First try to get the latest price from the database
    const dbPrice = await fetchPriceFromDB(formattedSymbol);
    
    // Always fetch fresh data to ensure we have the latest prices
    const { data: invocationData, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [symbol] }
    });

    if (invocationError) {
      console.error('Error invoking edge function:', invocationError);
      // If we have a DB price, return it even if fresh fetch failed
      return dbPrice;
    }

    // Get the latest price after fetching fresh data
    const updatedPrice = await fetchPriceFromDB(formattedSymbol);
    return updatedPrice || dbPrice;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};