import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TopPerformers = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">🏆 Best ROI</CardTitle>
        <span className="text-sm text-gray-500">Top Performers</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold flex items-center gap-2">
              SolbergInvest
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Elite Predictor
              </span>
            </div>
            <div className="text-sm text-gray-500">156 successful predictions</div>
          </div>
          <div className="text-green-500 font-semibold">+324.5%</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold flex items-center gap-2">
              CryptoWhale
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Pro Trader
              </span>
            </div>
            <div className="text-sm text-gray-500">142 successful predictions</div>
          </div>
          <div className="text-green-500 font-semibold">+286.3%</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold flex items-center gap-2">
              BlockchainGuru
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Rising Star
              </span>
            </div>
            <div className="text-sm text-gray-500">128 successful predictions</div>
          </div>
          <div className="text-green-500 font-semibold">+245.7%</div>
        </div>
      </CardContent>
    </Card>
  );
};