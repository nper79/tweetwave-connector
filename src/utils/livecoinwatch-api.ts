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

// Implement rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between requests

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchFromLiveCoinWatch = async (endpoint: string, symbol: string, params: any = {}) => {
  try {
    const apiKey = await getLiveCoinWatchApiKey();
    const baseUrl = "https://api.livecoinwatch.com";
    
    // Rate limiting logic
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await wait(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();
    
    console.log(`Making LiveCoinWatch API request to ${endpoint} for ${symbol}`);
    
    const isHistorical = endpoint.includes('history');
    
    const requestBody = {
      currency: "USD",
      code: symbol,
      meta: true,
      ...(isHistorical ? {
        start: params.start,
        end: params.end,
      } : {})
    };

    console.log('Request body:', requestBody);
    
    // Implement retry logic with exponential backoff
    let retries = 3;
    let delay = 1000; // Start with 1 second delay

    while (retries > 0) {
      try {
        const response = await fetch(`${baseUrl}/coins/single${isHistorical ? '/history' : ''}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`LiveCoinWatch API response for ${symbol}:`, data);
          return data;
        }

        if (response.status === 429) { // Rate limit exceeded
          console.log(`Rate limit hit for ${symbol}, waiting ${delay}ms before retry`);
          await wait(delay);
          delay *= 2; // Exponential backoff
          retries--;
          continue;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        if (retries === 1) throw error; // Last retry, propagate error
        console.log(`Request failed for ${symbol}, retrying in ${delay}ms...`);
        await wait(delay);
        delay *= 2; // Exponential backoff
        retries--;
      }
    }

    throw new Error('Max retries reached');
  } catch (error) {
    console.error(`LiveCoinWatch API error:`, error);
    throw error;
  }
};