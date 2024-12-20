import { supabase } from "@/integrations/supabase/client";
import { fetchPriceFromDB } from "./price-utils";

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  const cleanCode = code.replace('$', '').toUpperCase();
  return cleanCode; // Don't append USDT here, let the API handle it
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    console.log(`Fetching historical price for ${symbol}`);
    return await fetchPriceFromDB(symbol, timestamp);
  } catch (error) {
    console.error('Error fetching historical price:', error);
    return null;
  }
};

export const fetchCryptoPrice = async (symbol: string | null): Promise<number | null> => {
  if (!symbol) return null;
  
  try {
    console.log(`Fetching current price for ${symbol}...`);
    
    // Try to get the latest price from the database
    const price = await fetchPriceFromDB(symbol);
    console.log(`Price from DB for ${symbol}:`, price);
    if (price !== null) return price;

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
    const updatedPrice = await fetchPriceFromDB(symbol);
    console.log(`Updated price for ${symbol}:`, updatedPrice);
    return updatedPrice;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};