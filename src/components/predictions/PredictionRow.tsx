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
  const { data: currentPrice, isLoading } = useQuery({
    queryKey: ['crypto-price', prediction.symbol],
    queryFn: () => fetchCryptoPrice(prediction.symbol),
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 1000,
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
        {isLoading ? "Loading..." : formatPrice(currentPrice)}
      </TableCell>
      <TableCell className="text-green-500">+{prediction.roi24h}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi3d}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi1w}%</TableCell>
      <TableCell className="text-green-500">+{prediction.roi1m}%</TableCell>
    </TableRow>
  );
};