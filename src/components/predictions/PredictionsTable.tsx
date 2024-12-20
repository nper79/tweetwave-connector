import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { usePredictions } from "@/hooks/use-predictions";
import { useQueries, useQuery } from "@tanstack/react-query";
import { formatCryptoSymbol, fetchHistoricalPrice, fetchCryptoPrice } from "@/utils/crypto-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PredictionsTableProps {
  username?: string;
}

export const PredictionsTable = ({ username = "SolbergInvest" }: PredictionsTableProps) => {
  const { data: tweets, isLoading: tweetsLoading } = useTwitterTimeline(username);
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictions(tweets || []);

  // Use useQuery to handle the async operations for predictions
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

  const uniqueCryptos = [...new Set(predictions.map(p => p.crypto))];
  console.log('Unique cryptos to fetch:', uniqueCryptos);
  
  // Fetch current prices for all unique cryptos
  const priceQueries = useQueries({
    queries: uniqueCryptos.map(crypto => ({
      queryKey: ['crypto-price', crypto],
      queryFn: () => fetchCryptoPrice(crypto),
      refetchInterval: 30000,
      retry: 2,
      retryDelay: 1000,
      staleTime: 20000,
    })),
  });

  const getCurrentPrice = (symbol: string | null) => {
    if (!symbol) return "---";
    const queryIndex = uniqueCryptos.indexOf(symbol);
    if (queryIndex === -1) return "---";
    
    const query = priceQueries[queryIndex];
    
    if (query.isError) {
      console.error(`Error fetching price for ${symbol}:`, query.error);
      return "Error";
    }
    
    if (query.isLoading) {
      return "Loading...";
    }
    
    const price = query.data;
    return price ? `$${Number(price).toLocaleString()}` : "N/A";
  };

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
            <TableRow key={`${prediction.crypto}-${prediction.predictionDate}`}>
              <TableCell className="font-medium">{prediction.crypto || "---"}</TableCell>
              <TableCell>${prediction.priceAtPrediction?.toLocaleString() || "---"}</TableCell>
              <TableCell>{getCurrentPrice(prediction.symbol)}</TableCell>
              <TableCell className="text-green-500">+{prediction.roi24h}%</TableCell>
              <TableCell className="text-green-500">+{prediction.roi3d}%</TableCell>
              <TableCell className="text-green-500">+{prediction.roi1w}%</TableCell>
              <TableCell className="text-green-500">+{prediction.roi1m}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};