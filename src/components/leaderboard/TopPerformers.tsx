import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Crown, Star } from "lucide-react";

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
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  SolbergInvest
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm">
                    <Crown className="h-3.5 w-3.5" />
                    Elite Predictor
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">156 successful predictions</div>
              </div>
              <div className="flex items-center gap-1 text-green-500 font-medium">
                <TrendingUp className="h-4 w-4" />
                +324.5%
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/40 dark:to-blue-900/20 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  CryptoWhale
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 shadow-sm">
                    <Award className="h-3.5 w-3.5" />
                    Pro Trader
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">142 successful predictions</div>
              </div>
              <div className="flex items-center gap-1 text-green-500 font-medium">
                <TrendingUp className="h-4 w-4" />
                +286.3%
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/40 dark:to-blue-900/20 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  BlockchainGuru
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 shadow-sm">
                    <Star className="h-3.5 w-3.5" />
                    Rising Star
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">128 successful predictions</div>
              </div>
              <div className="flex items-center gap-1 text-green-500 font-medium">
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