import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter, 
  Award, 
  Target, 
  TrendingUp,
  Users,
  Globe,
  CheckCircle2
} from "lucide-react";
import { CaseStudiesGrid, FeaturedCaseStudy } from "@/components/services/CaseStudies";
import { caseStudies, industries, getFeaturedCaseStudy } from "@/data/caseStudies";

const CaseStudiesPage = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All Industries");
  
  const featuredCaseStudy = getFeaturedCaseStudy();
  
  const filteredCaseStudies = useMemo(() => {
    if (selectedIndustry === "All Industries") {
      return caseStudies.filter(cs => !cs.featured);
    }
    return caseStudies.filter(cs => 
      cs.industry === selectedIndustry && !cs.featured
    );
  }, [selectedIndustry]);

  const stats = [
    { label: "Success Stories", value: "500+", icon: <Award className="w-5 h-5" /> },
    { label: "Industries Served", value: "25+", icon: <Target className="w-5 h-5" /> },
    { label: "Client Satisfaction", value: "98%", icon: <Users className="w-5 h-5" /> },
    { label: "Countries Covered", value: "180+", icon: <Globe className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full">
                <Award className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <Badge className="bg-amber-500 text-white border-0 mb-4">
              Real Results, Real Impact
            </Badge>
            
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
              data-testid="heading-case-studies"
            >
              Customer Success Stories
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8" data-testid="text-description">
              Discover how MoloChain has transformed logistics operations for businesses worldwide. 
              From global shipping optimization to e-commerce fulfillment, see the measurable 
              impact we've delivered for our clients.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-blue-200">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Verified Results</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span>Measurable ROI</span>
              </div>
              <div className="flex items-center gap-2 text-blue-200">
                <Globe className="w-5 h-5 text-green-400" />
                <span>Global Impact</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                data-testid={`stat-${index}`}
              >
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {featuredCaseStudy && (
          <div className="mb-12">
            <FeaturedCaseStudy caseStudy={featuredCaseStudy} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              All Case Studies
            </h2>
            <p className="text-muted-foreground">
              Browse our collection of success stories across industries
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <Select 
              value={selectedIndustry} 
              onValueChange={setSelectedIndustry}
            >
              <SelectTrigger 
                className="w-[220px]" 
                data-testid="select-industry-filter"
              >
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem 
                    key={industry} 
                    value={industry}
                    data-testid={`option-industry-${industry.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" data-testid="badge-count">
              {filteredCaseStudies.length} {filteredCaseStudies.length === 1 ? 'story' : 'stories'}
            </Badge>
          </div>
        </div>

        <CaseStudiesGrid caseStudies={filteredCaseStudies} columns={3} />

        <div className="mt-16 py-12 border-t">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Join hundreds of businesses that have transformed their logistics operations 
              with MoloChain. Let's discuss how we can help you achieve similar results.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                data-testid="button-contact-sales"
              >
                Contact Sales
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                data-testid="button-request-demo"
              >
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseStudiesPage;
