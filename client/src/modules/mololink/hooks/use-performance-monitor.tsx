import { useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  renderTime: number;
  fps: number;
  memoryUsage?: number;
  loadTime: number;
}

export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(0);

  useEffect(() => {
    // Track component mount time
    renderStartTime.current = performance.now();
    
    return () => {
      // Track component render time on unmount
      const renderTime = performance.now() - renderStartTime.current;
      // Performance tracking disabled in production
    };
  }, [componentName]);

  useEffect(() => {
    let animationFrameId: number;

    const measureFPS = () => {
      const now = performance.now();
      frameCount.current++;

      if (now >= lastTime.current + 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        
        const loadTime = performance.now() - renderStartTime.current;
        
        // Get memory usage if available
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo?.usedJSHeapSize / 1024 / 1024; // MB

        setMetrics({
          renderTime: loadTime,
          fps,
          memoryUsage,
          loadTime,
        });

        frameCount.current = 0;
        lastTime.current = now;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return metrics;
}

export function PerformanceIndicator({ 
  componentName, 
  showDetails = false 
}: { 
  componentName: string; 
  showDetails?: boolean;
}) {
  const metrics = usePerformanceMonitor(componentName);

  if (!metrics || !showDetails) return null;

  const getFPSStatus = (fps: number) => {
    if (fps >= 50) return "text-green-600";
    if (fps >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
      <div>Component: {componentName}</div>
      <div className={getFPSStatus(metrics.fps)}>FPS: {metrics.fps}</div>
      <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
      {metrics.memoryUsage && (
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      )}
    </div>
  );
}