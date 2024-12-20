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
    
    const response = await fetch(`https://api.livecoinwatch.com/${endpoint}`, {
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
      throw new Error(`LiveCoinWatch API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`LiveCoinWatch API error:`, error);
    throw error;
  }
};