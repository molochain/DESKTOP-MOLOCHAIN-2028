import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  serviceId: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: "h-8 w-8 [&_svg]:size-4",
  md: "h-10 w-10 [&_svg]:size-5",
  lg: "h-12 w-12 [&_svg]:size-6",
};

export function FavoriteButton({ serviceId, size = 'md' }: FavoriteButtonProps) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: favoriteStatus, isLoading: checkLoading } = useQuery<{ isFavorited: boolean }>({
    queryKey: ['/api/favorites/check', serviceId],
    enabled: isAuthenticated && !authLoading,
  });

  const isFavorited = favoriteStatus?.isFavorited ?? false;

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/favorites', { serviceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/check', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to favorites",
        description: "Service has been added to your favorites.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to favorites.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/favorites/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/check', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Service has been removed from your favorites.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites.",
        variant: "destructive",
      });
    },
  });

  const isPending = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add services to your favorites.",
        variant: "destructive",
      });
      return;
    }

    if (isFavorited) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending || checkLoading}
      className={cn(sizeStyles[size], "rounded-full")}
      data-testid={`button-favorite-${serviceId}`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isPending ? (
        <Loader2 className="animate-spin" data-testid={`icon-loading-${serviceId}`} />
      ) : (
        <Heart
          className={cn(
            "transition-colors duration-200",
            isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
          )}
          data-testid={`icon-heart-${serviceId}`}
        />
      )}
    </Button>
  );
}

export default FavoriteButton;
