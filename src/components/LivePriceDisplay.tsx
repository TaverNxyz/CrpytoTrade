import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useCryptoPrices from "@/hooks/useCryptoPrices";
import { useState } from "react";

const LivePriceDisplay = () => {
  const { prices, marketStats, loading, error, updatePrices } = useCryptoPrices();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      await updatePrices();
    } catch (err) {
      console.error('Manual update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    } else if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 8,
      }).format(price);
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading live prices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive mb-4">Error loading prices: {error}</p>
        <Button onClick={handleManualUpdate} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gradient">Live Cryptocurrency Prices</h2>
        <Button 
          onClick={handleManualUpdate} 
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Updating...' : 'Update Prices'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prices.slice(0, 9).map((crypto, index) => {
          const marketStat = marketStats.find(stat => 
            stat.symbol === `${crypto.symbol}/USDT`
          );
          
          const priceChange = marketStat?.price_change_percent_24h || 0;
          const isPositive = priceChange >= 0;

          return (
            <motion.div
              key={crypto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass glass-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {crypto.symbol}
                    </CardTitle>
                    <Badge 
                      variant={isPositive ? "default" : "destructive"}
                      className={isPositive ? "bg-green-500/20 text-green-400" : ""}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {priceChange.toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{crypto.name}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-gradient">
                      {formatPrice(crypto.current_price)}
                    </p>
                    {marketStat && (
                      <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{formatPrice(marketStat.price_change_24h)} (24h)
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Market Cap</p>
                      <p className="font-medium">{formatMarketCap(crypto.market_cap || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume (24h)</p>
                      <p className="font-medium">
                        {formatVolume(marketStat?.volume_24h || 0)}
                      </p>
                    </div>
                    {marketStat && (
                      <>
                        <div>
                          <p className="text-muted-foreground">High (24h)</p>
                          <p className="font-medium">{formatPrice(marketStat.high_24h)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Low (24h)</p>
                          <p className="font-medium">{formatPrice(marketStat.low_24h)}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(crypto.updated_at).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {marketStats.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gradient mb-4">Trading Pairs</h3>
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-primary/20">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Pair</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">24h Change</th>
                    <th className="p-4 font-medium">24h Volume</th>
                    <th className="p-4 font-medium">Spread</th>
                  </tr>
                </thead>
                <tbody>
                  {marketStats.slice(0, 10).map((stat, index) => {
                    const isPositive = stat.price_change_percent_24h >= 0;
                    return (
                      <motion.tr
                        key={stat.trading_pair_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-primary/10 hover:bg-primary/5"
                      >
                        <td className="p-4 font-medium">{stat.symbol}</td>
                        <td className="p-4">{formatPrice(stat.last_price)}</td>
                        <td className={`p-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          <div className="flex items-center">
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {stat.price_change_percent_24h.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-4">{formatVolume(stat.volume_24h)}</td>
                        <td className="p-4">{formatPrice(stat.spread)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePriceDisplay;