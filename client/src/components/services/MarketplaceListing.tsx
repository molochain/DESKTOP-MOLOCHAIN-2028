import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Store,
  ExternalLink,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface MarketplaceStatus {
  isListed: boolean;
  listingId?: string;
  status?: 'active' | 'pending' | 'inactive';
  price?: number;
  currency?: string;
  views?: number;
  inquiries?: number;
  rating?: number;
  listedAt?: string;
  marketplaceUrl?: string;
  availability?: string;
}

interface MarketplaceListingProps {
  serviceId: string;
  serviceName: string;
  className?: string;
}

export default function MarketplaceListing({ 
  serviceId, 
  serviceName,
  className 
}: MarketplaceListingProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const { 
    data: marketplaceData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery<MarketplaceStatus>({
    queryKey: [`/api/services/${serviceId}/marketplace`],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const listMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/services/${serviceId}/marketplace/list`, {
        serviceName,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing Request Submitted",
        description: "Your service listing request has been submitted to Mololink marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}/marketplace`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Listing Failed",
        description: error.message || "Failed to submit listing request. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5 text-muted-foreground" />
            Mololink Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Marketplace status temporarily unavailable.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2 text-yellow-700 underline"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isListed = marketplaceData?.isListed;
  const isPending = marketplaceData?.status === 'pending';
  const marketplaceUrl = marketplaceData?.marketplaceUrl || 
    `https://mololink.molochain.com/services/${serviceId}`;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5 text-primary" />
            Mololink Marketplace
          </CardTitle>
          {isListed && (
            <Badge 
              variant="default" 
              className="bg-green-100 text-green-700 hover:bg-green-200"
              data-testid="marketplace-listed-badge"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Listed
            </Badge>
          )}
          {isPending && (
            <Badge 
              variant="secondary"
              className="bg-yellow-100 text-yellow-700"
              data-testid="marketplace-pending-badge"
            >
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
        <CardDescription>
          {isListed 
            ? "This service is available on the Mololink professional marketplace."
            : "List this service on Mololink to reach more customers."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isListed && marketplaceData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {marketplaceData.price !== undefined && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-4 w-4 mx-auto text-green-600 mb-1" />
                  <div className="text-lg font-semibold">
                    {marketplaceData.currency || '$'}{marketplaceData.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Starting Price</div>
                </div>
              )}
              {marketplaceData.views !== undefined && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                  <div className="text-lg font-semibold">
                    {marketplaceData.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              )}
              {marketplaceData.inquiries !== undefined && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Store className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                  <div className="text-lg font-semibold">
                    {marketplaceData.inquiries}
                  </div>
                  <div className="text-xs text-muted-foreground">Inquiries</div>
                </div>
              )}
              {marketplaceData.availability && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                  <div className="text-lg font-semibold">
                    {marketplaceData.availability}
                  </div>
                  <div className="text-xs text-muted-foreground">Availability</div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="flex-1"
                asChild
                data-testid="view-marketplace-button"
              >
                <a 
                  href={marketplaceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Marketplace
                </a>
              </Button>
              <Button 
                variant="outline"
                onClick={() => refetch()}
                data-testid="refresh-marketplace-button"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {!isListed && !isPending && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-medium text-sm mb-2">Why list on Mololink?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Reach thousands of logistics professionals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Get qualified leads and inquiries
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Build your professional reputation
                </li>
              </ul>
            </div>

            <Button 
              onClick={() => listMutation.mutate()} 
              disabled={listMutation.isPending}
              className="w-full"
              data-testid="list-on-marketplace-button"
            >
              {listMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 mr-2" />
                  List on Marketplace
                </>
              )}
            </Button>
          </div>
        )}

        {isPending && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your listing is being reviewed. This usually takes 1-2 business days.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function MarketplaceBadge({ isListed, className }: { isListed?: boolean; className?: string }) {
  if (!isListed) return null;
  
  return (
    <Badge 
      className={`bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 ${className}`}
      data-testid="featured-marketplace-badge"
    >
      <Store className="h-3 w-3 mr-1" />
      Featured on Mololink
    </Badge>
  );
}
