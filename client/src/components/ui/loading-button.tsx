import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ButtonProps } from '@/components/ui/button';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({ 
  children, 
  isLoading, 
  loadingText, 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}