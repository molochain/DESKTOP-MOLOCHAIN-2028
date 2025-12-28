import { Link } from 'wouter';
import { ServiceRecommendation } from './ServiceRecommendationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ServiceRecommendationResultsProps {
  recommendations: ServiceRecommendation[];
  onReset: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ServiceRecommendationResults({ 
  recommendations, 
  onReset 
}: ServiceRecommendationResultsProps) {
  // Sort recommendations by match score (highest first)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-semibold text-blue-800 mb-2">Your Personalized Service Recommendations</h2>
        <p className="text-blue-700">
          Based on your requirements, we've identified the following services that would best meet your needs.
        </p>
      </div>
      
      <motion.div 
        className="grid gap-6 md:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {sortedRecommendations.map((recommendation) => (
          <motion.div key={recommendation.serviceId} variants={item}>
            <Card className="h-full flex flex-col hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>{recommendation.serviceName}</span>
                  <div className="text-sm font-medium px-2 py-1 bg-white border rounded-full flex items-center">
                    <span>Match:</span>
                    <span className="ml-1 text-blue-600">{Math.round(recommendation.matchScore * 100)}%</span>
                  </div>
                </CardTitle>
                <Progress value={recommendation.matchScore * 100} className="h-1.5 mt-2" />
              </CardHeader>
              <CardContent className="py-4 flex-grow">
                <CardDescription className="text-sm text-foreground/80 whitespace-pre-line">
                  {recommendation.reason}
                </CardDescription>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-muted/10">
                <Link href={`/services/${recommendation.serviceId}`}>
                  <Button className="w-full" variant="outline">
                    View Service Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="flex justify-center mt-8">
        <Button onClick={onReset} variant="outline" className="mr-4">
          Back to Requirements Form
        </Button>
        <Link href="/services">
          <Button variant="outline">
            View All Services
          </Button>
        </Link>
      </div>
    </div>
  );
}