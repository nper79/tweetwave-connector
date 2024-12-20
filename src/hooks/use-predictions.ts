import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tweet } from "@/types/twitter";
import { supabase } from "@/integrations/supabase/client";

const extractCryptoSymbol = (text: string): string | null => {
  const match = text.match(/\$[A-Z]{2,}/);
  return match ? match[0].substring(1) : null;
};

const extractTargetPrice = (text: string): number | null => {
  // Look for explicit target prices
  const targetMatch = text.match(/target:?\s*\$?(\d+(?:,\d{3})*(?:\.\d+)?)/i);
  if (targetMatch) return parseFloat(targetMatch[1].replace(/,/g, ''));
  
  // Look for price levels or projections
  const priceMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (priceMatch) return parseFloat(priceMatch[1].replace(/,/g, ''));
  
  return null;
};

const getCurrentPrice = async (crypto: string): Promise<number> => {
  // For now, return a mock price. In production, this should call a crypto price API
  return 50000; // Mock price
};

const isPredictionTweet = (tweet: Tweet) => {
  if (!tweet.text) return false;
  
  const cryptoSymbolRegex = /\$[A-Z]{2,}/;
  const hasCryptoSymbol = cryptoSymbolRegex.test(tweet.text);
  
  // Expanded list of prediction-related keywords and patterns
  const predictionKeywords = [
    // Explicit prediction terms
    'target', 'prediction', 'predict', 'forecast',
    'expecting', 'expect', 'projected', 'analysis',
    
    // Technical analysis terms
    'breakout', 'resistance', 'support', 'rally',
    'bullish', 'bearish', 'long', 'short',
    'headed', 'going', 'moving', 'trend',
    
    // Price action terms
    'price', 'level', 'zone', 'area',
    'high', 'low', 'peak', 'bottom',
    
    // Time-based predictions
    'soon', 'next', 'incoming', 'update',
    '2024', '2025', // Include years for future predictions
    
    // Chart patterns
    'pattern', 'formation', 'setup', 'chart',
    'technical', 'analysis', 'ta', 'study'
  ];
  
  // Check for prediction keywords
  const hasKeyword = predictionKeywords.some(keyword => 
    tweet.text?.toLowerCase().includes(keyword)
  );
  
  // Check for price mentions
  const hasPriceMention = /\$\d+|\d+\$/.test(tweet.text);
  
  // Check for chart images
  const hasChartImage = tweet.media?.photo && tweet.media.photo.length > 0;
  
  // Consider it a prediction if it has a crypto symbol AND either:
  // 1. Contains prediction keywords
  // 2. Contains price mentions
  // 3. Contains chart images along with some analysis context
  return hasCryptoSymbol && (hasKeyword || hasPriceMention || (hasChartImage && hasKeyword));
};

const parsePredictionFromTweet = (tweet: Tweet) => {
  if (!tweet.text) return null;
  
  const crypto = extractCryptoSymbol(tweet.text);
  if (!crypto) return null;
  
  return {
    crypto,
    price_at_prediction: 50000, // Mock price for now
    target_price: extractTargetPrice(tweet.text),
    tweet_id: tweet.tweet_id,
    tweet_text: tweet.text,
    prediction_date: tweet.created_at
  };
};

export const usePredictions = (tweets: Tweet[] = []) => {
  const queryClient = useQueryClient();

  const storePrediction = async (tweet: Tweet) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null; // Skip storing if not authenticated

    const prediction = parsePredictionFromTweet(tweet);
    if (!prediction) return null;

    const { data, error } = await supabase
      .from('predictions')
      .upsert({
        ...prediction,
        user_id: user.id,
      }, {
        onConflict: 'tweet_id'
      });

    if (error) throw error;
    return data;
  };

  // Store predictions mutation
  const storePredictionMutation = useMutation({
    mutationFn: storePrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
    },
  });

  // Query for predictions
  return useQuery({
    queryKey: ['predictions', tweets.map(t => t.tweet_id)],
    queryFn: async () => {
      console.log("Analyzing tweets for predictions...");
      const predictionTweets = tweets.filter(isPredictionTweet);
      console.log(`Found ${predictionTweets.length} prediction tweets`);
      
      // Try to store predictions if authenticated
      for (const tweet of predictionTweets) {
        try {
          await storePredictionMutation.mutateAsync(tweet);
        } catch (error) {
          console.error('Error storing prediction:', error);
          // Continue with other predictions even if one fails
        }
      }

      // Return predictions from tweets even if not stored
      return predictionTweets.map(tweet => {
        const prediction = parsePredictionFromTweet(tweet);
        return {
          prediction: prediction || {
            crypto: extractCryptoSymbol(tweet.text || ''),
            price_at_prediction: 50000, // Mock price
            target_price: extractTargetPrice(tweet.text || ''),
            tweet_id: tweet.tweet_id,
            tweet_text: tweet.text,
            prediction_date: tweet.created_at
          },
          tweet
        };
      });
    },
    enabled: tweets.length > 0,
  });
};