import { TableCell, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchCryptoPrice } from "@/utils/crypto-utils";
import { formatPrice } from "@/utils/price-utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  });

  console.log(`PredictionRow - ${prediction.crypto}:`, {
    currentPrice,
    isLoading,
    isError
  });

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <Skeleton className="h-12 w-full" />
        </TableCell>
      </TableRow>
    );
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-red-500">
          Error loading prediction data
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{prediction.crypto || "---"}</TableCell>
      <TableCell>{formatPrice(prediction.priceAtPrediction)}</TableCell>
      <TableCell>{formatPrice(currentPrice)}</TableCell>
      <TableCell className="text-green-500">+{prediction.roi24h}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi3d}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi1w}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi1m}%</TableCell>
    </TableRow>
  );
};