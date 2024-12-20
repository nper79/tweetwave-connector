import { TableCell, TableRow } from "@/components/ui/table";
import { ArrowUpIcon } from "lucide-react";

interface PredictionRowProps {
  prediction: {
    crypto: string;
    priceAtPrediction: number;
    targetPrice: number;
    roi24h: number;
    roi3d: number;
    roi1w: number;
    roi1m: number;
  };
}

export const PredictionRow = ({ prediction }: PredictionRowProps) => {
  const formatPrice = (price: number) => {
    return price < 1 ? `$${price.toFixed(6)}` : `$${price.toFixed(2)}`;
  };

  const formatROI = (roi: number) => {
    return (
      <div className="flex items-center gap-1 text-green-500">
        <ArrowUpIcon className="h-4 w-4" />
        <span>+{roi.toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <TableRow className="border-b dark:border-gray-800">
      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
        {prediction.crypto}
      </TableCell>
      <TableCell className="text-gray-900 dark:text-gray-100">
        {formatPrice(prediction.priceAtPrediction)}
      </TableCell>
      <TableCell className="text-gray-900 dark:text-gray-100">
        {formatPrice(prediction.targetPrice)}
      </TableCell>
      <TableCell>{formatROI(prediction.roi24h)}</TableCell>
      <TableCell>{formatROI(prediction.roi3d)}</TableCell>
      <TableCell>{formatROI(prediction.roi1w)}</TableCell>
      <TableCell>{formatROI(prediction.roi1m)}</TableCell>
    </TableRow>
  );
};