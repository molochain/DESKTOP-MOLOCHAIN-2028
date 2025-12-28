import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface HealthRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'reliability' | 'security' | 'maintenance';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  timeToImplement: string;
  preventiveScore: number;
  confidence: number;
  createdAt: string;
}

interface HealthRecommendationsData {
  recommendations: HealthRecommendation[];
  lastAnalysis: string | null;
  totalRecommendations: number;
  priorityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  categoryCounts: {
    performance: number;
    reliability: number;
    security: number;
    maintenance: number;
  };
}

interface RecommendationStats {
  overview: {
    total: number;
    lastAnalysis: string | null;
    avgConfidence: number;
    avgPreventiveScore: number;
  };
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  byImpact: Record<string, number>;
  preventiveAnalysis: {
    highPreventive: number;
    mediumPreventive: number;
    lowPreventive: number;
  };
}

export function useHealthRecommendations() {
  return useQuery<HealthRecommendationsData>({
    queryKey: ['health-recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/health-recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch health recommendations');
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useHealthRecommendationStats() {
  return useQuery<RecommendationStats>({
    queryKey: ['health-recommendations-stats'],
    queryFn: async () => {
      const response = await fetch('/api/health-recommendations/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch recommendation statistics');
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useTriggerAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/health-recommendations/analyze', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to trigger health analysis');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['health-recommendations-stats'] });
      toast({
        title: "Analysis Complete",
        description: "Health recommendations updated with latest system data",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to trigger health analysis. Please try again.",
        variant: "destructive",
      });
    }
  });
}

export function useImplementRecommendation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      const response = await fetch(`/api/health-recommendations/${recommendationId}/implement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendationId,
          implementedBy: 'System Administrator',
          notes: 'Marked as implemented from dashboard'
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark recommendation as implemented');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['health-recommendations-stats'] });
      toast({
        title: "Recommendation Implemented",
        description: "The recommendation has been marked as implemented",
      });
    },
    onError: () => {
      toast({
        title: "Implementation Failed",
        description: "Failed to mark recommendation as implemented",
        variant: "destructive",
      });
    }
  });
}

export function useAutoFix() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/health-recommendations/auto-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to execute auto-fix');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['health-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['health-recommendations-stats'] });
      
      const { successful, total } = data.data.summary;
      toast({
        title: "Auto-Fix Complete",
        description: `Successfully applied ${successful}/${total} optimizations`,
      });
    },
    onError: () => {
      toast({
        title: "Auto-Fix Failed",
        description: "Failed to execute automatic fixes. Please try manual implementation.",
        variant: "destructive",
      });
    }
  });
}