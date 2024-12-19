import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { TwitterTimeline } from "@/components/twitter/TwitterTimeline";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { usePriceHistory, calculateROI } from "@/hooks/use-livecoinwatch";

interface Prediction {
  crypto: string;
  symbol: string;
  priceAtPrediction: number;
  currentPrice: number;
  predictionDate: number;
  roi24h: number;
  roi3d: number;
  roi1w: number;
  roi1m: number;
}

// Sample predictions data - in a real app, this would come from your backend
const predictions: Prediction[] = [
  {
    crypto: "Bitcoin",
    symbol: "BTC",
    priceAtPrediction: 35000,
    currentPrice: 40000,
    predictionDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    roi24h: 2.86,
    roi3d: 7.14,
    roi1w: 11.43,
    roi1m: 17.14,
  },
  {
    crypto: "Ethereum",
    symbol: "ETH",
    priceAtPrediction: 2000,
    currentPrice: 2200,
    predictionDate: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    roi24h: 2.86,
    roi3d: 7.14,
    roi1w: 11.43,
    roi1m: 17.14,
  },
];

const Profile = () => {
  const { username } = useParams();
  const now = Date.now();
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Example of using the hook for Bitcoin price history
  const { data: btcHistory } = usePriceHistory({
    symbol: "BTC",
    start: oneMonthAgo,
    end: now,
  });

  console.log("BTC Price History:", btcHistory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </Link>
          <a
            href={`https://x.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2"
          >
            View on X <ExternalLink className="h-4 w-4" />
          </a>
        </div>

      <div className="space-y-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {username}'s Profile
        </h1>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Predictions</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CRYPTO</TableHead>
                  <TableHead>PRICE AT PREDICTION</TableHead>
                  <TableHead>CURRENT PRICE</TableHead>
                  <TableHead>24H ROI</TableHead>
                  <TableHead>3D ROI</TableHead>
                  <TableHead>1W ROI</TableHead>
                  <TableHead>1M ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction.crypto}>
                    <TableCell className="font-medium">{prediction.crypto}</TableCell>
                    <TableCell>${prediction.priceAtPrediction.toLocaleString()}</TableCell>
                    <TableCell>${prediction.currentPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-green-500">+{prediction.roi24h}%</TableCell>
                    <TableCell className="text-green-500">+{prediction.roi3d}%</TableCell>
                    <TableCell className="text-green-500">+{prediction.roi1w}%</TableCell>
                    <TableCell className="text-green-500">+{prediction.roi1m}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Latest Predictions</h2>
          <TwitterTimeline username={username} />
        </Card>
      </div>
    </div>
  );
};

export default Profile;
