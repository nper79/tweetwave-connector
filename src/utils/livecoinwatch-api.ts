import { supabase } from "@/integrations/supabase/client";

interface LiveCoinWatchResponse {
  rate: number;
  history?: Array<{
    date: number;
    rate: number;
  }>;
}

const getLiveCoinWatchApiKey = async () => {
  const { data: { secret: apiKey } } = await supabase.functions.invoke('get-secret-value', {
    body: { name: 'LIVECOINWATCH_API_KEY' }
  });
  return apiKey;
};

export const fetchFromLiveCoinWatch = async (endpoint: string, symbol: string, params: any = {}) => {
  try {
    const apiKey = await getLiveCoinWatchApiKey();
    const baseUrl = "https://api.livecoinwatch.com";
    
    console.log(`Making LiveCoinWatch API request to ${endpoint} for ${symbol}`);
    
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        currency: "USD",
        code: symbol,
        meta: true,
        ...params
      }),
    });

    if (!response.ok) {
      throw new Error(`LiveCoinWatch API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`LiveCoinWatch API response for ${symbol}:`, data);
    return data;
  } catch (error) {
    console.error(`LiveCoinWatch API error:`, error);
    throw error;
  }
};