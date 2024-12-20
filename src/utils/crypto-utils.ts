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
    
    return await fetchPriceFromDB(formattedSymbol, timestamp);
  } catch (error) {
    return null;
  }
};

export const fetchCryptoPrice = async (symbol: string | null): Promise<number | null> => {
  if (!symbol) return null;
  
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;
    
    // Try to get the latest price from the database
    const price = await fetchPriceFromDB(formattedSymbol);
    
    // Always fetch fresh data to ensure we have the latest prices
    const { data, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [symbol] }
    });

    if (invocationError) {
      throw invocationError;
    }

    // Get the latest price after fetching fresh data
    const updatedPrice = await fetchPriceFromDB(formattedSymbol);
    return updatedPrice || price;
  } catch (error) {
    return null;
  }
};