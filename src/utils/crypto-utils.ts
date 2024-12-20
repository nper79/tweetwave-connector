import { supabase } from "@/integrations/supabase/client";

let API_KEY: string | null = null;

const getApiKey = async (): Promise<string> => {
  if (API_KEY) return API_KEY;
  
  const { data: { apiKey }, error } = await supabase.functions.invoke('get-livecoinwatch-key');
  if (error) throw error;
  
  API_KEY = apiKey;
  return apiKey;
};

export const formatCryptoSymbol = (code: string | null): string | null => {
  if (!code) return null;
  
  // Remove any $ prefix if present
  const cleanCode = code.replace('$', '');
  
  // Return the clean code
  return cleanCode;
};

export const fetchHistoricalPrice = async (symbol: string, timestamp: number): Promise<number | null> => {
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;

    console.log(`Fetching historical price for ${formattedSymbol} at ${new Date(timestamp).toISOString()}`);

    const apiKey = await getApiKey();
    const response = await fetch('https://api.livecoinwatch.com/coins/single/history', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        currency: 'USD',
        code: formattedSymbol,
        start: timestamp,
        end: timestamp + 300000, // 5 minutes after to ensure we get a price
        meta: false,
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch historical price:', await response.text());
      return null;
    }

    const data = await response.json();
    if (!data || !data.history || data.history.length === 0) {
      console.error('No historical price data found');
      return null;
    }

    return data.history[0].rate;
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
    
    console.log(`Fetching current price for symbol: ${formattedSymbol}`);
    
    const apiKey = await getApiKey();
    const response = await fetch('https://api.livecoinwatch.com/coins/single', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        currency: 'USD',
        code: formattedSymbol,
        meta: false,
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch current price:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.rate;
  } catch (error) {
    console.error('Failed to fetch current price:', error);
    return null;
  }
};