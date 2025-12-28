import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Building2, 
  Target, 
  CheckCircle2, 
  TrendingUp,
  Award,
  Star
} from "lucide-react";
import { type CaseStudy } from "@/data/caseStudies";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  compact?: boolean;
}

export const CaseStudyCard = ({ caseStudy, compact = false }: CaseStudyCardProps) => {
  return (
    <Link href={`/case-studies/${caseStudy.id}`}>
      <Card 
        className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
        data-testid={`card-case-study-${caseStudy.id}`}
      >
        <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
          <img 
            src={caseStudy.image} 
            alt={caseStudy.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            data-testid={`image-case-study-${caseStudy.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <Badge 
            className="absolute top-3 left-3 bg-blue-600 text-white"
            data-testid={`badge-industry-${caseStudy.id}`}
          >
            {caseStudy.industry}
          </Badge>
          {caseStudy.featured && (
            <Badge 
              className="absolute top-3 right-3 bg-amber-500 text-white"
              data-testid={`badge-featured-${caseStudy.id}`}
            >
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="w-4 h-4" />
            <span data-testid={`text-company-${caseStudy.id}`}>{caseStudy.company}</span>
          </div>
          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
            {caseStudy.title}
          </CardTitle>
          {!compact && (
            <CardDescription className="line-clamp-2 mt-2">
              {caseStudy.challenge.slice(0, 150)}...
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {caseStudy.results.slice(0, compact ? 2 : 4).map((result, idx) => (
              <div 
                key={idx} 
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center"
                data-testid={`result-metric-${caseStudy.id}-${idx}`}
              >
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {result.value}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {result.metric}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {caseStudy.serviceIds.slice(0, 2).map((serviceId) => (
                <Badge key={serviceId} variant="secondary" className="text-xs">
                  {serviceId}
                </Badge>
              ))}
              {caseStudy.serviceIds.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{caseStudy.serviceIds.length - 2}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700">
              Read More
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

interface CaseStudiesGridProps {
  caseStudies: CaseStudy[];
  columns?: 2 | 3 | 4;
}

export const CaseStudiesGrid = ({ caseStudies, columns = 3 }: CaseStudiesGridProps) => {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  if (caseStudies.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-case-studies">
        <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Case Studies Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filter to see more results.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}
      data-testid="case-studies-grid"
    >
      {caseStudies.map((caseStudy) => (
        <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
      ))}
    </div>
  );
};

interface FeaturedCaseStudyProps {
  caseStudy: CaseStudy;
}

export const FeaturedCaseStudy = ({ caseStudy }: FeaturedCaseStudyProps) => {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900"
      data-testid="featured-case-study"
    >
      <div className="absolute inset-0 opacity-20">
        <img 
          src={caseStudy.image} 
          alt={caseStudy.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/70" />
      
      <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-amber-500 text-white border-0">
              <Award className="w-3 h-3 mr-1" />
              Featured Success Story
            </Badge>
            <Badge variant="outline" className="text-white border-white/30">
              {caseStudy.industry}
            </Badge>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="featured-title">
            {caseStudy.title}
          </h2>
          
          <div className="flex items-center gap-2 text-blue-200 mb-6">
            <Building2 className="w-5 h-5" />
            <span className="text-lg" data-testid="featured-company">{caseStudy.company}</span>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">The Challenge</h4>
                <p className="text-blue-100 text-sm line-clamp-3">
                  {caseStudy.challenge}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Our Solution</h4>
                <p className="text-blue-100 text-sm line-clamp-3">
                  {caseStudy.solution}
                </p>
              </div>
            </div>
          </div>
          
          <Link href={`/case-studies/${caseStudy.id}`}>
            <Button 
              className="bg-white text-blue-900 hover:bg-blue-50"
              data-testid="button-read-featured"
            >
              Read Full Case Study
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {caseStudy.results.map((result, idx) => (
            <div 
              key={idx}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20"
              data-testid={`featured-result-${idx}`}
            >
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white mb-1">
                {result.value}
              </div>
              <div className="text-sm font-medium text-white">
                {result.metric}
              </div>
              <div className="text-xs text-blue-200 mt-1">
                {result.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseStudiesGrid;
