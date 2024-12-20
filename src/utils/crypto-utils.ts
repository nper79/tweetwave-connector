import { supabase } from "@/integrations/supabase/client";
import { fetchPriceFromDB } from "./price-utils";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  // Remove $ and any existing USDT, then append USDT
  const cleanCode = code.replace('$', '').replace(/USDT$/i, '').toUpperCase();
  return `${cleanCode}USDT`;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol} at ${new Date(timestamp).toISOString()}`);
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;
    
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
    
    console.log(`Fetching current price for ${formattedSymbol}...`);
    
    // Try to get the latest price from the database
    const price = await fetchPriceFromDB(formattedSymbol);
    console.log(`Price from DB for ${formattedSymbol}:`, price);
    if (price !== null) return price;

    // If we don't have a recent price, fetch fresh data
    console.log(`Fetching fresh price for ${formattedSymbol}...`);
    const { data, error: invocationError } = await supabase.functions.invoke('fetch-coincap-prices', {
      body: { symbols: [formattedSymbol] }
    });

    if (invocationError) {
      console.error('Error invoking edge function:', invocationError);
      throw invocationError;
    }

    // Get the latest price after fetching fresh data
    const updatedPrice = await fetchPriceFromDB(formattedSymbol);
    console.log(`Updated price for ${formattedSymbol}:`, updatedPrice);
    return updatedPrice;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};