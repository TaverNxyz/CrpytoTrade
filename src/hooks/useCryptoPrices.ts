import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CryptoPriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  price_change_percent_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  updated_at: string;
}

export interface MarketStats {
  trading_pair_id: string;
  symbol: string;
  last_price: number;
  price_change_24h: number;
  price_change_percent_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  bid_price: number;
  ask_price: number;
  spread: number;
}

export const useCryptoPrices = () => {
  const [prices, setPrices] = useState<CryptoPriceData[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchPrices = async () => {
    try {
      setLoading(true);
      
      // Fetch cryptocurrency prices
      const { data: cryptoData, error: cryptoError } = await supabase
        .from('cryptocurrencies')
        .select('*')
        .order('market_cap', { ascending: false });

      if (cryptoError) throw cryptoError;

      // Fetch market stats with trading pair info
      const { data: statsData, error: statsError } = await supabase
        .from('market_stats')
        .select(`
          *,
          trading_pairs!inner(
            symbol,
            base_currency_id,
            quote_currency_id
          )
        `)
        .order('volume_24h', { ascending: false });

      if (statsError) throw statsError;

      setPrices(cryptoData || []);
      setMarketStats(statsData?.map(stat => ({
        trading_pair_id: stat.trading_pair_id,
        symbol: stat.trading_pairs.symbol,
        last_price: stat.last_price || 0,
        price_change_24h: stat.price_change_24h || 0,
        price_change_percent_24h: stat.price_change_percent_24h || 0,
        volume_24h: stat.volume_24h || 0,
        high_24h: stat.high_24h || 0,
        low_24h: stat.low_24h || 0,
        bid_price: stat.bid_price || 0,
        ask_price: stat.ask_price || 0,
        spread: stat.spread || 0,
      })) || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  // Update prices using edge function
  const updatePrices = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-crypto-prices`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update prices');
      }

      const result = await response.json();
      console.log('Prices updated:', result);
      
      // Refresh local data after update
      await fetchPrices();
      
      return result;
    } catch (err) {
      console.error('Error updating prices:', err);
      throw err;
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchPrices();

    // Subscribe to cryptocurrency changes
    const cryptoSubscription = supabase
      .channel('crypto-prices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cryptocurrencies'
        },
        (payload) => {
          console.log('Crypto price update:', payload);
          fetchPrices();
        }
      )
      .subscribe();

    // Subscribe to market stats changes
    const statsSubscription = supabase
      .channel('market-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_stats'
        },
        (payload) => {
          console.log('Market stats update:', payload);
          fetchPrices();
        }
      )
      .subscribe();

    // Set up periodic price updates (every 30 seconds)
    const interval = setInterval(() => {
      updatePrices().catch(console.error);
    }, 30000);

    return () => {
      cryptoSubscription.unsubscribe();
      statsSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    prices,
    marketStats,
    loading,
    error,
    updatePrices,
    refetch: fetchPrices
  };
};

export default useCryptoPrices;