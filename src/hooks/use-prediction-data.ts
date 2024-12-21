import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHistoricalPrice } from "@/utils/crypto-utils";
import { usePredictions } from "./use-predictions";
import { Tweet } from "@/types/twitter";

export const usePredictionData = (tweets: Tweet[] = [], username: string = "SolbergInvest") => {
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictions(tweets || []);
  const queryClient = useQueryClient();

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictions-with-prices', predictionsData],
    queryFn: async () => {
      if (!predictionsData) return [];
      
      const predictionPromises = predictionsData.map(async p => {
        const historicalPrice = await queryClient.fetchQuery({
          queryKey: ['historical-price', p.prediction.crypto, p.prediction.prediction_date],
          queryFn: () => fetchHistoricalPrice(
            p.prediction.crypto,
            new Date(p.prediction.prediction_date).getTime()
          ),
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
        });
        
        return {
          crypto: p.prediction.crypto,
          symbol: `${p.prediction.crypto}USDT`,
          priceAtPrediction: historicalPrice || p.prediction.price_at_prediction,
          targetPrice: p.prediction.target_price,
          predictionDate: new Date(p.prediction.prediction_date).getTime(),
          roi24h: 2.86,
          roi3d: 7.14,
          roi1w: 11.43,
          roi1m: 17.14,
        };
      });
      
      return Promise.all(predictionPromises);
    },
    enabled: !!predictionsData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return { predictions, isLoading: isLoading || predictionsLoading };
};