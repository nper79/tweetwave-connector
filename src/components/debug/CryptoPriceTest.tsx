import { useQueries } from "@tanstack/react-query";
import { fetchCryptoPrice } from "@/utils/crypto-utils";
import { Card } from "@/components/ui/card";

const TEST_CRYPTOS = ['BTC', 'ETH', 'SOL', 'XRP', 'PEPE', 'FLOKI'];

export const CryptoPriceTest = () => {
  const results = useQueries({
    queries: TEST_CRYPTOS.map(symbol => ({
      queryKey: ['crypto-price-test', symbol],
      queryFn: () => fetchCryptoPrice(symbol),
      refetchInterval: 30000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }))
  });

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    
    // For very small numbers (less than 0.0001), use scientific notation
    if (price < 0.0001) {
      return price.toExponential(6);
    }
    
    // For small numbers (less than 0.01), show more decimals
    if (price < 0.01) {
      return `$${price.toFixed(8)}`;
    }
    
    // For regular numbers, use locale string with appropriate decimals
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })}`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Crypto Price Test</h2>
      <div className="space-y-4">
        {results.map((result, index) => {
          console.log(`${TEST_CRYPTOS[index]} price:`, result.data); // Add logging for debugging
          return (
            <div key={TEST_CRYPTOS[index]} className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">{TEST_CRYPTOS[index]}:</span>
              {result.isLoading ? (
                <span className="text-yellow-500">Loading...</span>
              ) : result.isError ? (
                <span className="text-red-500">
                  Error: {result.error?.message || 'Failed to fetch price'}
                </span>
              ) : (
                <span className="text-green-600">
                  {formatPrice(result.data)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};