import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
const GROK_API_URL = "https://api.x.ai/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const response = await fetch(GROK_API_URL, {
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
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});