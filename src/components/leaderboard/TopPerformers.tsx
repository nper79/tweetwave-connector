import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award } from "lucide-react";

export const TopPerformers = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Best ROI
        </CardTitle>
        <span className="text-sm text-gray-500 dark:text-gray-400">Top Performers</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  SolbergInvest
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                    Elite Predictor
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">156 successful predictions</div>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="h-4 w-4" />
                +324.5%
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  CryptoWhale
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                    Pro Trader
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">142 successful predictions</div>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="h-4 w-4" />
                +286.3%
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  BlockchainGuru
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                    Rising Star
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">128 successful predictions</div>
              </div>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="h-4 w-4" />
                +245.7%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};