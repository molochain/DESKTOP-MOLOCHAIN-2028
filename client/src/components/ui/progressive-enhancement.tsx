import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface ProgressiveComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingText?: string;
  delay?: number;
}

export function ProgressiveComponent({
  children,
  fallback,
  loadingText = "Loading...",
  delay = 0
}: ProgressiveComponentProps) {
  const [isVisible, setIsVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center p-8">
        {fallback || <LoadingSpinner text={loadingText} />}
      </div>
    );
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export function LazyComponentWrapper({
  children,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  threshold?: number;
}) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(elementRef);

    return () => observer.disconnect();
  }, [elementRef, threshold]);

  return (
    <div ref={setElementRef} className="min-h-[100px]">
      {shouldLoad ? (
        <ErrorBoundary>{children}</ErrorBoundary>
      ) : (
        <div className="animate-pulse bg-gray-200 rounded h-20"></div>
      )}
    </div>
  );
}