import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ThumbsUp, User, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Review {
  id: number;
  userId: number | null;
  rating: number;
  title: string | null;
  review: string;
  pros: string[] | null;
  cons: string[] | null;
  wouldRecommend: boolean;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  userName?: string;
  response?: string | null;
  responseDate?: string | null;
}

interface ServiceReviewsProps {
  serviceId: string;
  serviceName: string;
  canReview?: boolean;
}

export function ServiceReviews({ serviceId, serviceName, canReview = false }: ServiceReviewsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    review: '',
    pros: '',
    cons: '',
    wouldRecommend: true,
  });

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [`/api/services/${serviceId}/reviews`],
    enabled: !!serviceId,
  });
  
  const reviews = (reviewsData as { data?: Review[] })?.data || [];

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: typeof reviewForm) => {
      const response = await fetch(`/api/services/${serviceId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          pros: data.pros ? data.pros.split(',').map(p => p.trim()).filter(Boolean) : [],
          cons: data.cons ? data.cons.split(',').map(c => c.trim()).filter(Boolean) : [],
        }),
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to submit review');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}/reviews`] });
      setIsReviewDialogOpen(false);
      setReviewForm({
        rating: 5,
        title: '',
        review: '',
        pros: '',
        cons: '',
        wouldRecommend: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit review',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    },
  });

  // Mark review as helpful mutation
  const markHelpfulMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to mark as helpful');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}/reviews`] });
    },
  });

  // Calculate review statistics
  const calculateStats = () => {
    if (!reviews || reviews.length === 0) return { average: 0, breakdown: {} };
    
    const total = reviews.reduce((sum: number, r: Review) => sum + r.rating, 0);
    const average = total / reviews.length;
    
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r: Review) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });
    
    return { average, breakdown };
  };

  const stats = calculateStats();

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setReviewForm({ ...reviewForm, rating: star }) : undefined}
            data-testid={`star-rating-${star}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{stats.average.toFixed(1)}</div>
                <div>
                  {renderStars(Math.round(stats.average))}
                  <p className="text-sm text-muted-foreground mt-1">
                    {reviews.length} total reviews
                  </p>
                </div>
              </div>
              
              {/* Rating Breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.breakdown[rating] || 0;
                  const percentage = reviews && reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-10">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Actions */}
            <div className="flex flex-col justify-center items-center space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">
                  {stats.average >= 4 ? 'Highly Rated Service' : 'Share Your Experience'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Help others make informed decisions
                </p>
              </div>
              
              {canReview && (
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" data-testid="button-write-review">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Write a Review for {serviceName}</DialogTitle>
                      <DialogDescription>
                        Share your experience to help others
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      {/* Rating Selection */}
                      <div>
                        <Label>Your Rating</Label>
                        <div className="mt-2">
                          {renderStars(reviewForm.rating, true)}
                        </div>
                      </div>

                      {/* Review Title */}
                      <div>
                        <Label htmlFor="review-title">Review Title</Label>
                        <Input
                          id="review-title"
                          placeholder="Summarize your experience"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          data-testid="input-review-title"
                        />
                      </div>

                      {/* Review Text */}
                      <div>
                        <Label htmlFor="review-text">Your Review</Label>
                        <Textarea
                          id="review-text"
                          placeholder="Tell us about your experience with this service..."
                          className="min-h-[120px]"
                          value={reviewForm.review}
                          onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                          data-testid="textarea-review"
                        />
                      </div>

                      {/* Pros and Cons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="review-pros">Pros (comma-separated)</Label>
                          <Input
                            id="review-pros"
                            placeholder="Fast delivery, good communication..."
                            value={reviewForm.pros}
                            onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                            data-testid="input-review-pros"
                          />
                        </div>
                        <div>
                          <Label htmlFor="review-cons">Cons (comma-separated)</Label>
                          <Input
                            id="review-cons"
                            placeholder="High cost, limited options..."
                            value={reviewForm.cons}
                            onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                            data-testid="input-review-cons"
                          />
                        </div>
                      </div>

                      {/* Would Recommend */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="would-recommend"
                          checked={reviewForm.wouldRecommend}
                          onChange={(e) => setReviewForm({ ...reviewForm, wouldRecommend: e.target.checked })}
                          className="rounded border-gray-300"
                          data-testid="checkbox-would-recommend"
                        />
                        <Label htmlFor="would-recommend">
                          I would recommend this service to others
                        </Label>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsReviewDialogOpen(false)}
                          data-testid="button-cancel-review"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => submitReviewMutation.mutate(reviewForm)}
                          disabled={!reviewForm.review || submitReviewMutation.isPending}
                          data-testid="button-submit-review"
                        >
                          {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        {review.verifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold">{review.title}</h4>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{review.userName || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    {review.wouldRecommend && (
                      <Badge variant="outline" className="text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Recommends
                      </Badge>
                    )}
                  </div>

                  {/* Review Content */}
                  <p className="text-sm">{review.review}</p>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {review.pros && review.pros.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Pros:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {review.pros.map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons && review.cons.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-1">Cons:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {review.cons.map((con, index) => (
                            <li key={index}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Business Response */}
                  {review.response && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Business Response:</p>
                      <p className="text-sm">{review.response}</p>
                      {review.responseDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on {format(new Date(review.responseDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markHelpfulMutation.mutate(review.id)}
                      disabled={markHelpfulMutation.isPending}
                      data-testid={`button-helpful-${review.id}`}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Helpful ({review.helpfulCount})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}