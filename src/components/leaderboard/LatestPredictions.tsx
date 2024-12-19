import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export const LatestPredictions = () => {
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">
          <span className="mr-2">🎯</span>Latest Predictions
        </CardTitle>
        <span className="text-sm text-gray-500">Live Updates</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold flex items-center gap-2">
              SolbergInvest
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                $ARB
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              $ARB looking bullish! Target: $1.50 by EOW. Chart shows clear breakout...
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-500 text-sm">Target: $1.50</span>
              <span className="text-gray-400 text-sm">3 minutes ago</span>
            </div>
          </div>
          <ExternalLink className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};