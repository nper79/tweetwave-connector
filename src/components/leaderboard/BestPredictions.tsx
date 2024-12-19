import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Award } from "lucide-react";

interface Prediction {
  username: string;
  crypto: string;
  entryPrice: number;
  currentPrice: number;
  roi: number;
  date: string;
}

const bestPredictions: Prediction[] = [
  {
    username: "SolbergInvest",
    crypto: "BTC",
    entryPrice: 29450,
    currentPrice: 42800,
    roi: 45.33,
    date: "Oct 15, 2023"
  },
  {
    username: "CryptoWhale",
    crypto: "SOL",
    entryPrice: 32.5,
    currentPrice: 74.8,
    roi: 130.15,
    date: "Nov 2, 2023"
  },
  {
    username: "BlockchainGuru",
    crypto: "ETH",
    entryPrice: 1650,
    currentPrice: 2250,
    roi: 36.36,
    date: "Dec 1, 2023"
  }
];

export const BestPredictions = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Best Predictions
        </CardTitle>
        <span className="text-sm text-gray-500 dark:text-gray-400">All Time Best ROI</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {bestPredictions.map((prediction, index) => (
          <div 
            key={index}
            className={`p-3 rounded-md ${
              index === 0 
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-100 dark:border-yellow-800'
                : 'bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/40 dark:to-blue-900/20 border border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {prediction.username}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    ${prediction.crypto}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Entry: ${prediction.entryPrice.toLocaleString()} → Current: ${prediction.currentPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Predicted on {prediction.date}
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-500 font-medium">
                <TrendingUp className="h-4 w-4" />
                +{prediction.roi.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};