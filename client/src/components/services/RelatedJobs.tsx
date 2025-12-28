import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Building2,
  ExternalLink,
  Users,
  DollarSign,
  Laptop
} from "lucide-react";
import { motion } from "framer-motion";

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  department: string | null;
  category: string;
  requirements: string[] | null;
  benefits: string[] | null;
  salaryRange: string | null;
  experienceLevel: string | null;
  isRemote: boolean;
  isActive: boolean;
  createdAt: string;
}

interface RelatedJobsResponse {
  jobs: Job[];
  serviceId: string;
  matchedCategories: string[];
  total: number;
}

interface RelatedJobsProps {
  serviceId: string;
  serviceName: string;
  limit?: number;
}

function JobTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    'full-time': { label: 'Full-time', variant: 'default' },
    'part-time': { label: 'Part-time', variant: 'secondary' },
    'contract': { label: 'Contract', variant: 'outline' },
    'internship': { label: 'Internship', variant: 'secondary' },
  };

  const config = typeConfig[type.toLowerCase()] || { label: type, variant: 'secondary' as const };

  return (
    <Badge variant={config.variant} data-testid={`badge-job-type-${type}`}>
      {config.label}
    </Badge>
  );
}

function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
        data-testid={`card-job-${job.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h4 
                className="font-semibold text-gray-900 line-clamp-1"
                data-testid={`text-job-title-${job.id}`}
              >
                {job.title}
              </h4>
              {job.department && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span data-testid={`text-job-department-${job.id}`}>{job.department}</span>
                </div>
              )}
            </div>
            <JobTypeBadge type={job.type} />
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span data-testid={`text-job-location-${job.id}`}>{job.location}</span>
              {job.isRemote && (
                <Badge variant="outline" className="text-xs">
                  <Laptop className="h-3 w-3 mr-1" />
                  Remote
                </Badge>
              )}
            </div>
            
            {job.salaryRange && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span data-testid={`text-job-salary-${job.id}`}>{job.salaryRange}</span>
              </div>
            )}
            
            {job.experienceLevel && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="capitalize" data-testid={`text-job-experience-${job.id}`}>
                  {job.experienceLevel} level
                </span>
              </div>
            )}
          </div>

          <p 
            className="text-sm text-gray-600 line-clamp-2 mb-4"
            data-testid={`text-job-description-${job.id}`}
          >
            {job.description}
          </p>

          <Link href={`/careers/${job.id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              data-testid={`button-view-job-${job.id}`}
            >
              View Details
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function JobCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ serviceName }: { serviceName: string }) {
  return (
    <div 
      className="text-center py-8 px-4"
      data-testid="empty-state-no-jobs"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Briefcase className="h-8 w-8 text-gray-400" />
      </div>
      <h4 className="font-medium text-gray-900 mb-2">No Current Openings</h4>
      <p className="text-sm text-gray-600 mb-4">
        There are no job openings related to {serviceName} at this time.
        Check back soon or browse all available positions.
      </p>
      <Link href="/careers">
        <Button variant="outline" size="sm" data-testid="button-view-all-careers">
          View All Careers
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}

export default function RelatedJobs({ serviceId, serviceName, limit = 3 }: RelatedJobsProps) {
  const { data, isLoading, error } = useQuery<RelatedJobsResponse>({
    queryKey: [`/api/jobs/by-service/${serviceId}?limit=${limit}`],
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    return null;
  }

  return (
    <Card data-testid="related-jobs-section">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg" data-testid="text-related-jobs-title">
                Career Opportunities
              </CardTitle>
              <p className="text-sm text-gray-500">
                Join our team in {serviceName.toLowerCase()}
              </p>
            </div>
          </div>
          <Link href="/careers">
            <Button variant="ghost" size="sm" data-testid="button-all-careers-link">
              View All
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(limit)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.jobs.length === 0 ? (
          <EmptyState serviceName={serviceName} />
        ) : (
          <>
            <div 
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="jobs-grid"
            >
              {data.jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
            {data.total > limit && (
              <div className="mt-4 text-center">
                <Link href="/careers">
                  <Button variant="outline" data-testid="button-more-opportunities">
                    View {data.total - limit} More Opportunities
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
