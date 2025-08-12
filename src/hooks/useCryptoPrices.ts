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
      
      // For now, use mock data since database tables might not exist
      const mockPrices: CryptoPriceData[] = [
        {
          id: '1',
          symbol: 'BTC',
          name: 'Bitcoin',
          current_price: 42000,
          market_cap: 800000000000,
          price_change_24h: 1200,
          price_change_percent_24h: 2.94,
          volume_24h: 25000000000,
          high_24h: 43000,
          low_24h: 41000,
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          symbol: 'ETH',
          name: 'Ethereum',
          current_price: 2800,
          market_cap: 350000000000,
          price_change_24h: -50,
          price_change_percent_24h: -1.75,
          volume_24h: 12000000000,
          high_24h: 2900,
          low_24h: 2750,
          updated_at: new Date().toISOString()
        }
      ];

      const mockMarketStats: MarketStats[] = [
        {
          trading_pair_id: '1',
          symbol: 'BTC/USDT',
          last_price: 42000,
          price_change_24h: 1200,
          price_change_percent_24h: 2.94,
          volume_24h: 25000000000,
          high_24h: 43000,
          low_24h: 41000,
          bid_price: 41995,
          ask_price: 42005,
          spread: 10
        }
      ];

      setPrices(mockPrices);
      setMarketStats(mockMarketStats);
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