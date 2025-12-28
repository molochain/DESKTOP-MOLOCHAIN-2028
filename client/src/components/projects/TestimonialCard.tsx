import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export interface Testimonial {
  author: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  delay?: number;
}

const TestimonialCard = ({ testimonial, delay = 0 }: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative h-full">
        <CardContent className="pt-6">
          <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
          <div className="flex items-center gap-2 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-gray-600 italic mb-4">"{testimonial.content}"</p>
          <div className="mt-4">
            <p className="font-semibold text-gray-900">{testimonial.author}</p>
            <p className="text-sm text-gray-500">{testimonial.role}</p>
            <p className="text-sm text-gray-500">{testimonial.company}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestimonialCard;
