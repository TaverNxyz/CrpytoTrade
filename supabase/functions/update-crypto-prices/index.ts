import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoinGeckoPrice {
  id: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch current prices from CoinGecko API
    const coinGeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,usd-coin,cardano,avalanche-2,polkadot&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
    );

    if (!coinGeckoResponse.ok) {
      throw new Error('Failed to fetch prices from CoinGecko');
    }

    const priceData: CoinGeckoPrice[] = await coinGeckoResponse.json();

    // Map CoinGecko IDs to our symbols
    const symbolMap: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'ripple': 'XRP',
      'usd-coin': 'USDC',
      'cardano': 'ADA',
      'avalanche-2': 'AVAX',
      'polkadot': 'DOT'
    };

    // Update cryptocurrency prices
    for (const coin of priceData) {
      const symbol = symbolMap[coin.id];
      if (!symbol) continue;

      // Update cryptocurrency table
      const { error: updateError } = await supabaseClient
        .from('cryptocurrencies')
        .update({
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          updated_at: new Date().toISOString()
        })
        .eq('symbol', symbol);

      if (updateError) {
        console.error(`Error updating ${symbol}:`, updateError);
        continue;
      }

      // Get cryptocurrency ID for price history
      const { data: cryptoData, error: cryptoError } = await supabaseClient
        .from('cryptocurrencies')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (cryptoError || !cryptoData) {
        console.error(`Error getting crypto ID for ${symbol}:`, cryptoError);
        continue;
      }

      // Insert price history
      const { error: historyError } = await supabaseClient
        .from('price_history')
        .insert({
          cryptocurrency_id: cryptoData.id,
          price: coin.current_price,
          volume_24h: coin.total_volume,
          market_cap: coin.market_cap,
          timestamp: new Date().toISOString()
        });

      if (historyError) {
        console.error(`Error inserting price history for ${symbol}:`, historyError);
      }

      // Update market stats for USDT pairs
      const { data: tradingPairs, error: pairsError } = await supabaseClient
        .from('trading_pairs')
        .select('id')
        .eq('symbol', `${symbol}/USDT`);

      if (pairsError || !tradingPairs || tradingPairs.length === 0) {
        continue;
      }

      const tradingPairId = tradingPairs[0].id;
      const price24hAgo = coin.current_price - coin.price_change_24h;

      // Upsert market stats
      const { error: statsError } = await supabaseClient
        .from('market_stats')
        .upsert({
          trading_pair_id: tradingPairId,
          price_24h_ago: price24hAgo,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          volume_24h: coin.total_volume,
          price_change_24h: coin.price_change_24h,
          price_change_percent_24h: coin.price_change_percentage_24h,
          last_price: coin.current_price,
          bid_price: coin.current_price * 0.9995,
          ask_price: coin.current_price * 1.0005,
          spread: coin.current_price * 0.001,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'trading_pair_id'
        });

      if (statsError) {
        console.error(`Error updating market stats for ${symbol}:`, statsError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Prices updated successfully',
        updated_count: priceData.length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error updating prices:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})