import { Tweet } from "@/types/twitter";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const getDeepSeekApiKey = async () => {
  const { data, error } = await supabase.functions.invoke('get-secret', {
    body: { name: 'DEEPSEEK_API_KEY' }
  });
  
  if (error || !data?.secret) {
    console.error('Failed to get DeepSeek API key:', error);
    toast.error('Failed to get API key. Please check your configuration.');
    return null;
  }
  
  return data.secret;
};

export const analyzeTweetForPrediction = async (tweet: Tweet): Promise<boolean> => {
  try {
    const apiKey = await getDeepSeekApiKey();
    if (!apiKey) return false;

    console.log("Analyzing tweet with DeepSeek API...");
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an AI trained to identify cryptocurrency price predictions in tweets. Respond with 'true' if the tweet contains a price prediction for a cryptocurrency, or 'false' if it doesn't. A prediction should include a specific price target or percentage movement."
          },
          {
            role: "user",
            content: tweet.text
          }
        ],
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API Error:", errorData);
      
      if (response.status === 401) {
        toast.error("Invalid API key. Please check your DeepSeek API configuration.");
        return false;
      }
      
      throw new Error(errorData.error?.message || "Failed to analyze tweet");
    }

    const data = await response.json();
    return data.choices[0].message.content.toLowerCase().includes("true");
  } catch (error) {
    console.error("Error analyzing tweet:", error);
    toast.error("Failed to analyze tweet. Please try again later.");
    return false;
  }
};

export const extractPredictionDetails = async (tweet: Tweet) => {
  try {
    const apiKey = await getDeepSeekApiKey();
    if (!apiKey) return null;

    console.log("Extracting prediction details...");
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `You are an AI trained to extract cryptocurrency prediction details from tweets.
            Return a JSON object with the following structure:
            {
              "crypto": "symbol of the cryptocurrency",
              "priceAtPrediction": "current price mentioned",
              "targetPrice": "predicted price",
              "timeframe": "prediction timeframe"
            }
            If any field cannot be determined, use null.`
          },
          {
            role: "user",
            content: tweet.text
          }
        ],
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API Error:", errorData);
      
      if (response.status === 401) {
        toast.error("Invalid API key. Please check your DeepSeek API configuration.");
        return null;
      }
      
      throw new Error(errorData.error?.message || "Failed to extract prediction details");
    }

    const data = await response.json();
    
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch {
      console.error("Failed to parse prediction details");
      return null;
    }
  } catch (error) {
    console.error("Error extracting prediction details:", error);
    toast.error("Failed to extract prediction details. Please try again later.");
    return null;
  }
};