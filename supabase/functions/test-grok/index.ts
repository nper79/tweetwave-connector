import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Exponential backoff retry logic
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || Math.pow(2, i);
        console.log(`Rate limited. Waiting ${retryAfter} seconds before retry ${i + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Request failed, retrying (${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries reached');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Grok API test...");
    
    if (!GROK_API_KEY) {
      console.error("GROK_API_KEY is not set");
      throw new Error("GROK_API_KEY is not set");
    }

    console.log("API Key present, making request to Grok API...");
    
    const requestBody = {
      model: "grok-2-1212",
      messages: [{
        role: "user",
        content: "Say hello!"
      }],
      temperature: 0.7,
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetchWithRetry(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      
      // Special handling for rate limiting
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rate limit exceeded. Please try again later.",
            details: errorText
          }),
          { 
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': response.headers.get('Retry-After') || '60'
            }
          }
        );
      }
      
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: error.status || 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});