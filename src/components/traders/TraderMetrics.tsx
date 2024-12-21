import { TrendingUp, TrendingDown } from "lucide-react";

interface TraderMetricsProps {
  predictions: number;
  successRate: number;
  roi: number;
  change24h: number;
}

export const TraderMetrics = ({ predictions, successRate, roi, change24h }: TraderMetricsProps) => {
  return (
    <>
      <td className="px-4 py-2">
        <div>
          <div className="font-medium">{predictions}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">total</div>
        </div>
      </td>
      <td className="px-4 py-2">
        <div>
          <div className="font-medium">{successRate}%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">success</div>
        </div>
      </td>
      <td className="px-4 py-2">
        <div>
          <div className="text-green-500 font-medium flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +{roi}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">total return</div>
        </div>
      </td>
      <td className="px-4 py-2">
        <div className={`flex items-center gap-1 ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {change24h}%
        </div>
      </td>
    </>
  );
};