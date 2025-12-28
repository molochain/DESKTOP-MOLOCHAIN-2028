import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const TestimonialSkeleton = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-gray-200 animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TestimonialSkeleton;
