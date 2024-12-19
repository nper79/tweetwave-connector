import { Tweet } from "@/types/twitter";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export const analyzeTweetForPrediction = async (tweet: Tweet, apiKey: string): Promise<boolean> => {
  try {
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
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Failed to analyze tweet");
    }

    const data = await response.json();
    const isPrediction = data.choices[0].message.content.toLowerCase().includes("true");
    
    return isPrediction;
  } catch (error) {
    console.error("Error analyzing tweet:", error);
    return false;
  }
};

export const extractPredictionDetails = async (tweet: Tweet, apiKey: string) => {
  try {
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
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Failed to extract prediction details");
    }

    const data = await response.json();
    try {
      return JSON.parse(data.choices[0].message.content);
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Error extracting prediction details:", error);
    return null;
  }
};