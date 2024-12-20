import { TableCell, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchCryptoPrice } from "@/utils/crypto-utils";
import { formatPrice } from "@/utils/price-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PredictionRowProps {
  prediction: {
    crypto: string;
    symbol: string;
    priceAtPrediction: number;
    targetPrice: number;
    predictionDate: number;
    roi24h: number;
    roi3d: number;
    roi1w: number;
    roi1m: number;
  };
}

export const PredictionRow = ({ prediction }: PredictionRowProps) => {
  const { data: currentPrice, isLoading, isError } = useQuery({
    queryKey: ['crypto-price', prediction.crypto],
    queryFn: () => fetchCryptoPrice(prediction.crypto),
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 20000,
    enabled: !!prediction.crypto
  });

  // Only log when there's an error or significant price change
  if (isError || (currentPrice && Math.abs(currentPrice - prediction.priceAtPrediction) / prediction.priceAtPrediction > 0.05)) {
    console.log(`Price update for ${prediction.crypto}:`, {
      currentPrice,
      priceAtPrediction: prediction.priceAtPrediction,
      error: isError ? 'Failed to fetch price' : null
    });
  }

  if (isLoading) {
    return (
      <TableRow>
        <TableCell className="font-medium">{prediction.crypto}</TableCell>
        <TableCell>{formatPrice(prediction.priceAtPrediction)}</TableCell>
        <TableCell>
          <Skeleton className="h-6 w-24" />
        </TableCell>
        <TableCell>
          <div className="text-green-500 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +{prediction.roi24h}%
          </div>
        </TableCell>
        <TableCell>
          <div className="text-green-500 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +{prediction.roi3d}%
          </div>
        </TableCell>
        <TableCell>
          <div className="text-green-500 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +{prediction.roi1w}%
          </div>
        </TableCell>
        <TableCell>
          <div className="text-green-500 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +{prediction.roi1m}%
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell className="font-medium">{prediction.crypto}</TableCell>
        <TableCell>{formatPrice(prediction.priceAtPrediction)}</TableCell>
        <TableCell className="text-red-500">Error fetching price</TableCell>
        <TableCell colSpan={4} className="text-center text-gray-500">
          Unable to calculate ROI
        </TableCell>
      </TableRow>
    );
  }

  const calculateRoi = () => {
    if (!currentPrice || !prediction.priceAtPrediction) return 0;
    return ((currentPrice - prediction.priceAtPrediction) / prediction.priceAtPrediction) * 100;
  };

  const roi = calculateRoi();
  const isPositive = roi >= 0;

  return (
    <TableRow>
      <TableCell className="font-medium">{prediction.crypto}</TableCell>
      <TableCell>{formatPrice(prediction.priceAtPrediction)}</TableCell>
      <TableCell>{formatPrice(currentPrice)}</TableCell>
      <TableCell>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isPositive ? '+' : ''}{prediction.roi24h}%
        </div>
      </TableCell>
      <TableCell>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isPositive ? '+' : ''}{prediction.roi3d}%
        </div>
      </TableCell>
      <TableCell>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isPositive ? '+' : ''}{prediction.roi1w}%
        </div>
      </TableCell>
      <TableCell>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {isPositive ? '+' : ''}{prediction.roi1m}%
        </div>
      </TableCell>
    </TableRow>
  );
};