import { supabase } from "@/integrations/supabase/client";

export const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return "N/A";
  
  try {
    const numPrice = Number(price);
    
    // For extremely small numbers (less than 0.0001)
    if (numPrice < 0.0001) {
      const scientificStr = numPrice.toExponential(8);
      const [base, exponent] = scientificStr.split('e');
      const baseNum = parseFloat(base);
      const formattedBase = baseNum.toFixed(8);
      return `$${formattedBase}`;
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

export const fetchPriceFromDB = async (symbol: string, timestamp?: number) => {
  console.log(`Fetching price for ${symbol} ${timestamp ? 'at ' + new Date(timestamp).toISOString() : '(latest)'}`);
  
  try {
    const query = supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', symbol);

    if (timestamp) {
      query
        .gte('timestamp', new Date(timestamp - 24 * 60 * 60 * 1000).toISOString())
        .lte('timestamp', new Date(timestamp + 24 * 60 * 60 * 1000).toISOString());
    }

    const { data: prices, error: dbError } = await query
      .order('timestamp', { ascending: timestamp ? true : false })
      .limit(1);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (prices && prices.length > 0) {
      console.log(`Found price for ${symbol}:`, prices[0].price);
      return prices[0].price;
    }

    console.log(`No price found for ${symbol}`);
    return null;
  } catch (error) {
    console.error('Error fetching price from DB:', error);
    return null;
  }
};