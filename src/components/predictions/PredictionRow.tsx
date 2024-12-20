import { TableCell, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchCryptoPrice } from "@/utils/crypto-utils";

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
  const { data: currentPrice, isLoading, isError, error } = useQuery({
    queryKey: ['crypto-price', prediction.symbol],
    queryFn: () => fetchCryptoPrice(prediction.symbol),
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 20000,
  });

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "---";
    return `$${Number(price).toLocaleString()}`;
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{prediction.crypto || "---"}</TableCell>
      <TableCell>${prediction.priceAtPrediction?.toLocaleString() || "---"}</TableCell>
      <TableCell>
        {isLoading ? (
          <span className="text-gray-500">Loading...</span>
        ) : isError ? (
          <span className="text-gray-500">Fetching price...</span>
        ) : (
          formatPrice(currentPrice)
        )}
      </TableCell>
      <TableCell className="text-green-500">+{prediction.roi24h}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi3d}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi1w}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi1m}%</TableCell>
    </TableRow>
  );
};