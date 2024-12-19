import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API_CONFIG, formatCryptoSymbol } from "@/utils/crypto-utils";

interface Prediction {
  crypto: string;
  symbol: string;
  priceAtPrediction: number;
  predictionDate: number;
  roi24h: number;
  roi3d: number;
  roi1w: number;
  roi1m: number;
}

const predictions: Omit<Prediction, 'currentPrice'>[] = [
  {
    crypto: "Bitcoin",
    symbol: "BTC",
    priceAtPrediction: 35000,
    predictionDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    roi24h: 2.86,
    roi3d: 7.14,
    roi1w: 11.43,
    roi1m: 17.14,
  },
  {
    crypto: "Ethereum",
    symbol: "ETH",
    priceAtPrediction: 2000,
    predictionDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    roi24h: 2.86,
    roi3d: 7.14,
    roi1w: 11.43,
    roi1m: 17.14,
  },
];

const fetchCryptoPrice = async (symbol: string) => {
  const response = await fetch(
    `https://${API_CONFIG.RAPID_API_HOST}/v1/cryptoprice?symbol=${formatCryptoSymbol(symbol)}`,
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_CONFIG.RAPID_API_KEY,
        'X-RapidAPI-Host': API_CONFIG.RAPID_API_HOST
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch price');
  }

  const data = await response.json();
  return data.price;
};

export const PredictionsTable = () => {
  const { data: btcPrice } = useQuery({
    queryKey: ['crypto-price', 'BTC'],
    queryFn: () => fetchCryptoPrice('BTC'),
    refetchInterval: 30000,
  });

  const { data: ethPrice } = useQuery({
    queryKey: ['crypto-price', 'ETH'],
    queryFn: () => fetchCryptoPrice('ETH'),
    refetchInterval: 30000,
  });

  const getCurrentPrice = (symbol: string) => {
    if (symbol === 'BTC') return btcPrice;
    if (symbol === 'ETH') return ethPrice;
    return null;
  };

  // We'll need to integrate this with the predictions from the tweets
  return (
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
              <TableCell>
                {getCurrentPrice(prediction.symbol) 
                  ? `$${Number(getCurrentPrice(prediction.symbol)).toLocaleString()}`
                  : 'Loading...'}
              </TableCell>
              <TableCell className="text-green-500">+{prediction.roi24h}%</TableCell>
              <TableCell className="text-green-500">+{prediction.roi3d}%</TableCell>
              <TableCell className="text-green-500">+{prediction.roi1w}%</TableCell>
              <TableCell className="text-green-500">+{prediction.roi1m}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};