import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTestimonials, Testimonial } from '@/services/cmsContentService';
import { demoTestimonials } from '@/data/demoContent';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Star, Quote, User, Pause, Play } from 'lucide-react';

interface TestimonialsCarouselProps {
  autoPlayInterval?: number;
  showControls?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="max-w-3xl mx-auto" data-testid={`testimonial-card-${testimonial.id}`}>
      <CardContent className="pt-8 pb-6 px-8">
        <Quote className="w-10 h-10 text-primary/20 mb-4" />
        <p className="text-lg md:text-xl text-foreground/80 mb-6 leading-relaxed">
          "{testimonial.content}"
        </p>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {testimonial.avatar && <AvatarImage src={testimonial.avatar} alt={testimonial.name} />}
              <AvatarFallback>
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg" data-testid="testimonial-name">{testimonial.name}</p>
              {(testimonial.position || testimonial.company) && (
                <p className="text-sm text-muted-foreground">
                  {testimonial.position}
                  {testimonial.position && testimonial.company && ' at '}
                  {testimonial.company && (
                    <span className="font-medium" data-testid="testimonial-company">{testimonial.company}</span>
                  )}
                </p>
              )}
            </div>
          </div>
          {testimonial.rating && <StarRating rating={testimonial.rating} />}
        </div>
      </CardContent>
    </Card>
  );
}

function CarouselSkeleton() {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="pt-8 pb-6 px-8">
        <Skeleton className="w-10 h-10 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestimonialsCarousel({ 
  autoPlayInterval = 5000, 
  showControls = true 
}: TestimonialsCarouselProps) {
  const { data: cmsData, isLoading, isError } = useTestimonials();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const testimonials = cmsData && cmsData.length > 0 ? cmsData : demoTestimonials;
  const activeTestimonials = testimonials?.filter(t => t.is_active !== false) || [];

  const nextSlide = useCallback(() => {
    if (activeTestimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeTestimonials.length);
  }, [activeTestimonials.length]);

  const prevSlide = useCallback(() => {
    if (activeTestimonials.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);
  }, [activeTestimonials.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (!isPlaying || activeTestimonials.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, autoPlayInterval, nextSlide, activeTestimonials.length]);

  if (isLoading) {
    return (
      <div className="py-12" data-testid="testimonials-loading">
        <CarouselSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="testimonials-error">
        <p>Failed to load testimonials</p>
      </div>
    );
  }

  return (
    <div className="relative py-12" data-testid="testimonials-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <TestimonialCard testimonial={activeTestimonials[currentIndex]} />
        </motion.div>
      </AnimatePresence>

      {showControls && activeTestimonials.length > 1 && (
        <>
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              data-testid="carousel-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2">
              {activeTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  data-testid={`carousel-dot-${index}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              data-testid="carousel-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              data-testid="carousel-play-pause"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {currentIndex + 1} of {activeTestimonials.length}
          </p>
        </>
      )}
    </div>
  );
}
