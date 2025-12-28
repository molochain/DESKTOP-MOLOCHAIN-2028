import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import { Search, MapPin, Building2, DollarSign, Clock, Bookmark, BriefcaseIcon } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  saved?: boolean;
}

const sampleJobs: Job[] = [
  {
    id: "job1",
    title: "Senior Supply Chain Manager",
    company: "Global Logistics Corp",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    posted: "2 days ago",
    description: "Lead supply chain operations for our midwest distribution network. Oversee inventory management, vendor relationships, and logistics optimization.",
    requirements: ["10+ years supply chain experience", "SAP expertise", "Six Sigma certification preferred"],
  },
  {
    id: "job2",
    title: "Port Operations Supervisor",
    company: "Pacific Shipping Lines",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: "$85,000 - $105,000",
    posted: "5 days ago",
    description: "Supervise daily port operations including container handling, vessel scheduling, and customs compliance.",
    requirements: ["5+ years port operations", "Knowledge of maritime regulations", "TWIC card required"],
  },
  {
    id: "job3",
    title: "Freight Forwarding Specialist",
    company: "Express Global Solutions",
    location: "Miami, FL",
    type: "Full-time",
    salary: "$65,000 - $80,000",
    posted: "1 week ago",
    description: "Coordinate international shipments, manage documentation, and ensure customs compliance for import/export operations.",
    requirements: ["3+ years freight forwarding", "Customs broker license preferred", "Bilingual English/Spanish"],
  },
  {
    id: "job4",
    title: "Warehouse Operations Manager",
    company: "DistribuTech Solutions",
    location: "Dallas, TX",
    type: "Full-time",
    salary: "$95,000 - $115,000",
    posted: "3 days ago",
    description: "Manage 200,000 sq ft distribution center operations, including staff, inventory, and fulfillment processes.",
    requirements: ["7+ years warehouse management", "WMS experience required", "Lean management certification"],
  },
  {
    id: "job5",
    title: "Transportation Analyst",
    company: "Smart Logistics Inc",
    location: "Remote",
    type: "Full-time",
    salary: "$70,000 - $90,000",
    posted: "1 day ago",
    description: "Analyze transportation data to optimize routes, reduce costs, and improve delivery performance metrics.",
    requirements: ["Data analysis skills", "SQL proficiency", "Experience with TMS systems"],
  },
];

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredJobs = sampleJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = jobTypeFilter === "all" || job.type.toLowerCase().includes(jobTypeFilter.toLowerCase());
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Search Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  Job Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Keywords</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-job-search"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="City, state, or remote..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-10"
                      data-testid="input-location-filter"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Type</label>
                  <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                    <SelectTrigger data-testid="select-job-type">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Popular Searches</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="cursor-pointer">Supply Chain Manager</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Logistics Coordinator</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Warehouse Supervisor</Badge>
                    <Badge variant="secondary" className="cursor-pointer">Freight Broker</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Job Listings */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Jobs in Logistics & Supply Chain</CardTitle>
                  <span className="text-sm text-muted-foreground">{filteredJobs.length} jobs found</span>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recommended" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recommended" data-testid="tab-recommended">Recommended</TabsTrigger>
                    <TabsTrigger value="applied" data-testid="tab-applied">Applied</TabsTrigger>
                    <TabsTrigger value="saved" data-testid="tab-saved">Saved</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recommended" className="mt-6 space-y-4">
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-molochain-blue hover:underline cursor-pointer">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {job.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {job.salary}
                              </span>
                            </div>
                            <p className="mt-3 text-sm">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.requirements.slice(0, 3).map((req, index) => (
                                <Badge key={index} variant="outline">{req}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Posted {job.posted}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaveJob(job.id)}
                            data-testid={`button-save-${job.id}`}
                          >
                            <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <Button className="bg-molochain-blue hover:bg-molochain-blue/90" data-testid={`button-apply-${job.id}`}>
                            Apply Now
                          </Button>
                          <Button variant="outline">Learn More</Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="applied" className="mt-6">
                    <div className="text-center py-12 text-muted-foreground">
                      <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No applications yet</p>
                      <p className="text-sm mt-2">Jobs you apply to will appear here</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="saved" className="mt-6 space-y-4">
                    {savedJobs.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No saved jobs</p>
                        <p className="text-sm mt-2">Save jobs to review them later</p>
                      </div>
                    ) : (
                      sampleJobs
                        .filter(job => savedJobs.includes(job.id))
                        .map((job) => (
                          <div key={job.id} className="border rounded-lg p-6">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                            <Button className="mt-3" variant="outline" size="sm">View Job</Button>
                          </div>
                        ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MobileNav />
      <div className="md:hidden h-20"></div> {/* Spacer for mobile nav */}
    </div>
  );
}