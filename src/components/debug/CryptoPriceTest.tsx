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

  const formatPrice = (price: number | null | undefined) => {
    // Log the incoming price for debugging
    console.log('Formatting price:', price, typeof price);
    
    // Handle null/undefined/zero cases
    if (price === null || price === undefined) return 'N/A';
    if (price === 0) return '$0.00';
    
    try {
      const numPrice = Number(price);
      
      // For extremely small numbers (less than 0.0001)
      if (numPrice < 0.0001) {
        return `$${numPrice.toFixed(8)}`;
      }
      
      // For small numbers (less than 1)
      if (numPrice < 1) {
        return `$${numPrice.toFixed(6)}`;
      }
      
      // For regular numbers
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numPrice);
      
    } catch (error) {
      console.error('Error formatting price:', error, 'Price value:', price);
      return 'Error';
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Crypto Price Test</h2>
      <div className="space-y-4">
        {results.map((result, index) => {
          const symbol = TEST_CRYPTOS[index];
          const formattedPrice = formatPrice(result.data);
          console.log(`${symbol} price:`, result.data, 'formatted:', formattedPrice);
          
          return (
            <div key={symbol} className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">{symbol}:</span>
              {result.isLoading ? (
                <span className="text-yellow-500">Loading...</span>
              ) : result.isError ? (
                <span className="text-red-500">
                  Error: {result.error?.message || 'Failed to fetch price'}
                </span>
              ) : (
                <span className="text-green-600">
                  {formattedPrice}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};