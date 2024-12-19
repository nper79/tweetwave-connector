import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Target, Clock } from "lucide-react";

export const LatestPredictions = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" />
          Latest Predictions
        </CardTitle>
        <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                SolbergInvest
                <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded-full">
                  $ARB
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                $ARB looking bullish! Target: $1.50 by EOW. Chart shows clear breakout...
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-green-500 text-sm font-medium">Target: $1.50</span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  3 minutes ago
                </span>
              </div>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer ml-2 flex-shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};