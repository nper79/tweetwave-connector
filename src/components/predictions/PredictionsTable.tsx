import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { usePredictions } from "@/hooks/use-predictions";
import { useQuery } from "@tanstack/react-query";
import { formatCryptoSymbol, fetchHistoricalPrice } from "@/utils/crypto-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PredictionRow } from "./PredictionRow";

interface PredictionsTableProps {
  username?: string;
}

export const PredictionsTable = ({ username = "SolbergInvest" }: PredictionsTableProps) => {
  const { data: tweets, isLoading: tweetsLoading } = useTwitterTimeline(username);
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictions(tweets || []);

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions-with-prices', predictionsData],
    queryFn: async () => {
      if (!predictionsData) return [];
      
      const predictionPromises = predictionsData.map(async p => {
        const historicalPrice = await fetchHistoricalPrice(
          p.prediction.crypto,
          new Date(p.prediction.prediction_date).getTime()
        );
        
        return {
          crypto: p.prediction.crypto,
          symbol: p.prediction.crypto,
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
  });

  if (tweetsLoading || predictionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CRYPTO</TableHead>
            <TableHead>PRICE AT PREDICTION</TableHead>
            <TableHead>CURRENT PRICE</TableHead>
            <TableHead>24H ROI</TableHead>
            <TableHead>3D ROI</TableHead>
            <TableHead>1W ROI</TableHead>
            <TableHead>1M ROI</TableHead>
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