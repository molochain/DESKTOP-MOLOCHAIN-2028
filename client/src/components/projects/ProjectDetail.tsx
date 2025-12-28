import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  BarChart3,
  Globe2,
  Users,
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import TestimonialCard from "./TestimonialCard";
import TestimonialSkeleton from "./TestimonialSkeleton";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useState, useEffect } from "react";
import RouteMap from "../latest-projects/RouteMap";
import MilestoneTracker from "./MilestoneTracker";

interface ProjectMetric {
  label: string;
  value: string;
  icon: JSX.Element;
}

interface Testimonial {
  author: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

interface RoutePoint {
  name: string;
  coordinates: [number, number];
  type: "origin" | "destination" | "transit";
}

interface Route {
  points: RoutePoint[];
  transportationType: string;
}

interface ProjectDetailProps {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  client: string;
  location: string;
  industry: string;
  startDate: string;
  completionDate: string;
  metrics: ProjectMetric[];
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  testimonials?: Testimonial[];
  routes: Route[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  id,
  title,
  description,
  image,
  category,
  client,
  location,
  industry,
  startDate,
  completionDate,
  metrics,
  challenge,
  solution,
  results,
  technologies,
  testimonials: initialTestimonials,
  routes,
}) => {
  const [showContent, setShowContent] = useState(false);
  const { isLoading, testimonials } = useTestimonials(id, initialTestimonials);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!title) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600">The project details could not be loaded.</p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const transportationColors = {
    sea: "#0088FF",    
    air: "#FF4444",    
    road: "#44AA44",   
    rail: "#FF8800",   
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative h-96 rounded-xl overflow-hidden mb-8">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                  {category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <Link href={`/projects/${id}/collaboration`}>
                  <Button size="sm" className="flex items-center gap-2 bg-primary/90 hover:bg-primary">
                    <Users className="w-4 h-4" />
                    Collaborate
                  </Button>
                </Link>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-600 mb-8">{description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Client</span>
                  </div>
                  <p className="font-semibold">{client}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Location</span>
                  </div>
                  <p className="font-semibold">{location}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Timeline</span>
                  </div>
                  <p className="font-semibold">
                    {startDate} - {completionDate}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Globe2 className="w-4 h-4" />
                    <span className="text-sm">Industry</span>
                  </div>
                  <p className="font-semibold">{industry}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-12">
              {metrics.map((metric) => (
                <Card key={metric.label}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="flex justify-center text-primary mb-2">
                        {metric.icon}
                      </div>
                      <div className="text-2xl font-bold text-primary mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-600">{metric.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Project Milestones
              </h2>
              <MilestoneTracker projectId={id} />
            </section>

            <div className="space-y-12 mb-16">
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Route Visualization
                </h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <RouteMap routes={routes} className="h-[500px] w-full" />
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  {Object.entries(transportationColors).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-600 capitalize">
                        {type === 'air' ? `${type} Route (Dashed)` : `${type} Route`}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Challenge
                </h2>
                <p className="text-gray-600">{challenge}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Solution
                </h2>
                <p className="text-gray-600">{solution}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Key Results
                </h2>
                <ul className="space-y-2">
                  {results.map((result, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {result}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Technologies Used
                </h2>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              {initialTestimonials && initialTestimonials.length > 0 && (
                <AnimatePresence>
                  {showContent && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-8">
                        Client Testimonials
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                          <>
                            <TestimonialSkeleton delay={0.1} />
                            <TestimonialSkeleton delay={0.2} />
                          </>
                        ) : (
                          testimonials.map((testimonial, index) => (
                            <TestimonialCard
                              key={index}
                              testimonial={testimonial}
                              delay={index * 0.1}
                            />
                          ))
                        )}
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;