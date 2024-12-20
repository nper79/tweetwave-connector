import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { usePredictions } from "@/hooks/use-predictions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHistoricalPrice } from "@/utils/crypto-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PredictionRow } from "./PredictionRow";
import { useEffect } from "react";

interface PredictionsTableProps {
  username?: string;
}

export const PredictionsTable = ({ username = "SolbergInvest" }: PredictionsTableProps) => {
  const { data: tweets, isLoading: tweetsLoading } = useTwitterTimeline(username);
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictions(tweets || []);
  const queryClient = useQueryClient();

  // Prefetch prices when component mounts
  useEffect(() => {
    if (predictionsData) {
      predictionsData.forEach(p => {
        queryClient.prefetchQuery({
          queryKey: ['historical-price', p.prediction.crypto, p.prediction.prediction_date],
          queryFn: () => fetchHistoricalPrice(
            p.prediction.crypto,
            new Date(p.prediction.prediction_date).getTime()
          ),
          staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
          cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
        });
      });
    }
  }, [predictionsData, queryClient]);

  const { data: predictions = [] } = useQuery({
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
          staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
          cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
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
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  if (tweetsLoading || predictionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full dark:bg-gray-700" />
        <Skeleton className="h-8 w-full dark:bg-gray-700" />
        <Skeleton className="h-8 w-full dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b dark:border-gray-800">
            <TableHead className="text-gray-500 dark:text-gray-400">CRYPTO</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">PRICE AT PREDICTION</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">CURRENT PRICE</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">24H ROI</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">3D ROI</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">1W ROI</TableHead>
            <TableHead className="text-gray-500 dark:text-gray-400">1M ROI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.map((prediction) => (
            <PredictionRow 
              key={`${prediction.crypto}-${prediction.predictionDate}`}
              prediction={prediction}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};