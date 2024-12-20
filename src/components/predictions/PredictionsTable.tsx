import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { usePredictions } from "@/hooks/use-predictions";
import { useQueries } from "@tanstack/react-query";
import { API_CONFIG, formatCryptoSymbol } from "@/utils/crypto-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CryptoApiResponse {
  error: number;
  message: string;
  data: {
    symbol: string;
    base: string;
    price: string;
    exchanges: Array<{
      price: string;
      exchange: string;
      deviation: string;
    }>;
  };
}

// Mock data for development
const MOCK_PREDICTIONS = [
  {
    crypto: "BTC",
    symbol: "BTC",
    priceAtPrediction: 42000,
    targetPrice: 100000,
    predictionDate: new Date().getTime(),
    roi24h: 2.86,
    roi3d: 7.14,
    roi1w: 11.43,
    roi1m: 17.14,
  },
  {
    crypto: "ETH",
    symbol: "ETH",
    priceAtPrediction: 2200,
    targetPrice: 4000,
    predictionDate: new Date().getTime(),
    roi24h: 1.56,
    roi3d: 4.23,
    roi1w: 8.91,
    roi1m: 15.67,
  }
];

const fetchCryptoPrice = async (symbol: string | null) => {
  if (!symbol) return null;
  
  try {
    const formattedSymbol = formatCryptoSymbol(symbol);
    if (!formattedSymbol) return null;
    
    console.log(`Fetching price for symbol: ${formattedSymbol}`);
    
    const response = await fetch(
      `https://${API_CONFIG.RAPID_API_HOST}/tokens/${formattedSymbol}?base=USDT`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_CONFIG.RAPID_API_KEY,
          'X-RapidAPI-Host': API_CONFIG.RAPID_API_HOST
        }
      }
    );

    if (!response.ok) {
      console.error(`Error fetching price for ${symbol}:`, response.statusText);
      return null;
    }

    const responseData: CryptoApiResponse = await response.json();
    console.log(`Price data received for ${symbol}:`, responseData);
    
    if (!responseData.data || !responseData.data.price) {
      console.error(`Invalid price data for ${symbol}:`, responseData);
      return null;
    }

    return parseFloat(responseData.data.price);
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};

interface PredictionsTableProps {
  username?: string;
}

export const PredictionsTable = ({ username = "SolbergInvest" }: PredictionsTableProps) => {
  const { data: tweets, isLoading: tweetsLoading } = useTwitterTimeline(username);
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictions(tweets || []);

  // Get unique crypto symbols from predictions or mock data if no predictions
  const predictions = predictionsData?.map(p => ({
    crypto: p.prediction.crypto,
    symbol: p.prediction.crypto,
    priceAtPrediction: p.prediction.price_at_prediction,
    targetPrice: p.prediction.target_price,
    predictionDate: new Date(p.prediction.prediction_date).getTime(),
    roi24h: 2.86,
    roi3d: 7.14,
    roi1w: 11.43,
    roi1m: 17.14,
  })) || MOCK_PREDICTIONS;

  const uniqueCryptos = [...new Set(predictions.map(p => p.crypto))];
  console.log('Unique cryptos to fetch:', uniqueCryptos);
  
  // Fetch prices for all unique cryptos
  const priceQueries = useQueries({
    queries: uniqueCryptos.map(crypto => ({
      queryKey: ['crypto-price', crypto],
      queryFn: () => fetchCryptoPrice(crypto),
      refetchInterval: 30000,
      retry: 2,
      retryDelay: 1000,
      staleTime: 20000,
    })),
  });

  const getCurrentPrice = (symbol: string | null) => {
    if (!symbol) return "---";
    const queryIndex = uniqueCryptos.indexOf(symbol);
    if (queryIndex === -1) return "---";
    
    const query = priceQueries[queryIndex];
    
    if (query.isError) {
      console.error(`Error fetching price for ${symbol}:`, query.error);
      return "Error";
    }
    
    if (query.isLoading) {
      return "Loading...";
    }
    
    const price = query.data;
    return price ? `$${Number(price).toLocaleString()}` : "N/A";
  };

  if (tweetsLoading || predictionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

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
            <TableRow key={`${prediction.crypto}-${prediction.predictionDate}`}>
              <TableCell className="font-medium">{prediction.crypto || "---"}</TableCell>
              <TableCell>${prediction.priceAtPrediction?.toLocaleString() || "---"}</TableCell>
              <TableCell>{getCurrentPrice(prediction.symbol)}</TableCell>
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