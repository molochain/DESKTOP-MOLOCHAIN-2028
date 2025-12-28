import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TokenPriceTicker() {
  const [price, setPrice] = useState(0.00125);
  const [change24h, setChange24h] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Function to generate random updates
    const generateUpdate = () => {
      // Simulate price change
      const changePercent = (Math.random() - 0.5) * 0.1;
      setPrice(prev => {
        const newPrice = prev * (1 + changePercent);
        setTrend(newPrice > prev ? 'up' : 'down');
        return Number(newPrice.toFixed(6));
      });
      
      // Simulate 24h change
      setChange24h((Math.random() - 0.45) * 20);
      
      // Simulate volume
      setVolume24h(10000000 + Math.random() * 90000000);
      
      // Animate
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    };

    // Initial update after mount
    setTimeout(generateUpdate, 100);
    
    // Set up interval for regular updates
    intervalRef.current = setInterval(generateUpdate, 5000);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - runs once on mount

  const isPositive = change24h >= 0;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `$${(vol / 1000000).toFixed(1)}M`;
    }
    return `$${(vol / 1000).toFixed(0)}K`;
  };

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
      {/* Token Symbol */}
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">M</span>
        </div>
        <span className="text-xs font-semibold text-foreground/80">MOLOCHAIN</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1">
        <DollarSign className="h-3 w-3 text-muted-foreground" />
        <span 
          className={cn(
            "font-mono text-sm font-medium transition-all duration-300",
            isAnimating && trend === 'up' && "text-green-600 dark:text-green-400",
            isAnimating && trend === 'down' && "text-red-600 dark:text-red-400",
            !isAnimating && "text-foreground"
          )}
        >
          {price.toFixed(6)}
        </span>
      </div>

      {/* 24h Change */}
      <div className={cn(
        "flex items-center gap-0.5 px-1.5 py-0.5 rounded",
        isPositive ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
      )}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span className="text-xs font-medium">
          {isPositive ? "+" : ""}{change24h.toFixed(2)}%
        </span>
      </div>

      {/* Volume */}
      <div className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
        <span>Vol:</span>
        <span className="font-medium">{formatVolume(volume24h)}</span>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-1">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          isAnimating ? "bg-green-500 animate-pulse" : "bg-green-500"
        )} />
        <span className="text-[10px] text-muted-foreground uppercase">Live</span>
      </div>
    </div>
  );
}