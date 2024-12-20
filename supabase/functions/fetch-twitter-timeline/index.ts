import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RAPID_API_KEY = Deno.env.get('RAPID_API_KEY');
const RAPID_API_HOST = "twitter-api45.p.rapidapi.com";

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
    // Validate API key
    if (!RAPID_API_KEY) {
      console.error("RAPID_API_KEY is not set");
      throw new Error("API key configuration error");
    }

    const { screenname } = await req.json();
    console.log("Fetching tweets for:", screenname);
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    };

    console.log("Making request to Twitter API...");
    const response = await fetch(
      `https://${RAPID_API_HOST}/timeline.php?screenname=${screenname}`,
      options
    );

    const responseText = await response.text();
    console.log("Raw API Response:", responseText);

    if (!response.ok) {
      console.error("Twitter API Error Response:", responseText);
      console.error("Response status:", response.status);
      console.error("Response headers:", Object.fromEntries(response.headers.entries()));
      throw new Error(`Failed to fetch tweets: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      throw new Error("Invalid JSON response from Twitter API");
    }

    if (!data || !data.timeline) {
      console.error("Unexpected API response structure:", data);
      throw new Error("Invalid response structure from Twitter API");
    }

    console.log("Successfully fetched tweets:", data.timeline?.length || 0);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error in Edge Function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})