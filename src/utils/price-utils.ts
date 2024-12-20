import { supabase } from "@/integrations/supabase/client";

export const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return "N/A";
  
  try {
    const numPrice = Number(price);
    
    if (numPrice < 0.0001) {
      const scientificStr = numPrice.toExponential(8);
      const [base, exponent] = scientificStr.split('e');
      const baseNum = parseFloat(base);
      const formattedBase = baseNum.toFixed(8);
      return `$${formattedBase}`;
    }
    
    if (numPrice < 1) {
      return `$${numPrice.toFixed(6)}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  } catch (error) {
    console.error('Error formatting price:', error);
    return 'N/A';
  }
};

export const fetchPriceFromDB = async (symbol: string, timestamp?: number) => {
  try {
    let query = supabase
      .from('historical_prices')
      .select('*')
      .eq('symbol', symbol);

    if (timestamp) {
      // Expand the time window to find the closest price
      const startTime = new Date(timestamp - 24 * 60 * 60 * 1000); // 24h before
      const endTime = new Date(timestamp + 24 * 60 * 60 * 1000);   // 24h after
      
      query = query
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: false });
    } else {
      // For current price, get the most recent one
      query = query
        .order('timestamp', { ascending: false });
    }

    const { data: prices, error: dbError } = await query.limit(1);

    if (dbError) {
      console.error('Database error:', dbError);
      return null;
    }

    if (prices && prices.length > 0) {
      return prices[0].price;
    }

    return null;
  } catch (error) {
    console.error('Error fetching price from DB:', error);
    return null;
  }
};