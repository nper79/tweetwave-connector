import { useQuery } from "@tanstack/react-query";
import { fetchCryptoPrice } from "@/utils/crypto-utils";
import { Card } from "@/components/ui/card";

const TEST_CRYPTOS = ['BTC', 'ETH', 'SOL', 'XRP'];

export const CryptoPriceTest = () => {
  const queries = TEST_CRYPTOS.map(symbol => ({
    queryKey: ['crypto-price-test', symbol],
    queryFn: () => fetchCryptoPrice(symbol),
    refetchInterval: 30000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }));

  const results = queries.map(query => useQuery(query));

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Crypto Price Test</h2>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={TEST_CRYPTOS[index]} className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">{TEST_CRYPTOS[index]}:</span>
            {result.isLoading ? (
              <span>Loading...</span>
            ) : result.isError ? (
              <span className="text-red-500">
                Error: {result.error?.message || 'Failed to fetch price'}
              </span>
            ) : (
              <span className="text-green-600">
                ${result.data?.toLocaleString() || 'N/A'}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};