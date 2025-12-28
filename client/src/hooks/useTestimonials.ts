import { useState, useEffect } from "react";
import type { Testimonial } from "@/components/projects/TestimonialCard";

export const useTestimonials = (projectId: number, initialTestimonials?: Testimonial[]) => {
  const [isLoading, setIsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials || []);

  useEffect(() => {
    const loadTestimonials = async () => {
      setIsLoading(true);
      // Simulate network delay for smooth loading animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, we're just setting the initial testimonials
      // In a real app, this would fetch from an API
      setTestimonials(initialTestimonials || []);
      setIsLoading(false);
    };

    loadTestimonials();
  }, [projectId, initialTestimonials]);

  return {
    isLoading,
    testimonials,
  };
};
