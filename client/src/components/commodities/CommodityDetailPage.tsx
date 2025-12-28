import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ExternalLink, FileText, Share2, Truck, Landmark, Leaf, Database, Ship, ArrowLeftRight, MessageSquare } from "lucide-react";
import CommodityChat from "./CommodityChat";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

import { commodityData, commodityCategories, getCommodityColor, slugToCommodity } from "@/lib/commodityData";

export default function CommodityDetailPage({ type }: { type: string }) {
  // Find the correct commodity key using our slug-to-commodity mapping
  const commodityKey = slugToCommodity[type] || type;
  const commodityInfo = commodityData[commodityKey];
  const [activeTab, setActiveTab] = useState("overview");

  if (!commodityInfo) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Commodity Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The commodity type '{type}' was not found in our database.
        </p>
        <Button asChild>
          <Link href="/commodities">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Commodities
          </Link>
        </Button>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Sample data for charts
  const routePieData = commodityInfo.primaryRoutes.map((route, index) => ({
    name: `${route.from} to ${route.to}`,
    value: parseInt(route.volume.split(' ')[0].replace(/,/g, ''))
  }));

  const transportModesData = commodityInfo.transportationModes.map((mode, index) => ({
    name: mode,
    value: 20 + index * 15, // Simulated values
  }));

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Back link and header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href="/commodities">
            <a className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to All Commodities
            </a>
          </Link>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-md ${getCommodityColor(commodityInfo.name)}`}>
              {commodityInfo.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{commodityInfo.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {commodityInfo.rawTypes.map((type) => (
                  <Badge key={type} variant="outline">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant={activeTab === "overview" ? "default" : "ghost"} 
                className="w-full justify-start" 
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </Button>
              <Button 
                variant={activeTab === "transportation" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("transportation")}
              >
                <Truck className="mr-2 h-4 w-4" />
                Transportation
              </Button>
              <Button 
                variant={activeTab === "regulations" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("regulations")}
              >
                <Landmark className="mr-2 h-4 w-4" />
                Regulations
              </Button>
              <Button 
                variant={activeTab === "sustainability" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("sustainability")}
              >
                <Leaf className="mr-2 h-4 w-4" />
                Sustainability
              </Button>
              <Button 
                variant={activeTab === "data" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("data")}
              >
                <Database className="mr-2 h-4 w-4" />
                Market Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Related Commodities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {commodityInfo.relatedCommodities.map((relatedType) => {
                // Use type assertion to handle the index signature properly
                const categoryKey = relatedType as keyof typeof commodityCategories;
                const slug = commodityCategories[categoryKey] || '';
                return (
                  <Link key={relatedType} href={`/commodities/${slug}`}>
                    <a className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                      <Badge className={`${getCommodityColor(relatedType)}`}>
                        {relatedType}
                      </Badge>
                    </a>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Content area */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transportation">Transportation</TabsTrigger>
              <TabsTrigger value="regulations">Regulations</TabsTrigger>
              <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
              <TabsTrigger value="data">Market Data</TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Discussion
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {commodityInfo.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {commodityInfo.description}
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Handling Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {commodityInfo.handlingRequirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                      {commodityInfo.marketTrends.map((trend, index) => (
                        <li key={index}>{trend}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Business Cycle</CardTitle>
                  <CardDescription>Monthly shipment volume trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={commodityInfo.businessCycle}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="volume" stroke="#2563eb" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transportation Tab */}
            <TabsContent value="transportation" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transportation Modes</CardTitle>
                  <CardDescription>Common transportation methods for {commodityInfo.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-4">
                        {commodityInfo.transportationModes.map((mode, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                              {index % 2 === 0 ? <Ship className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="font-medium">{mode}</h4>
                              <p className="text-sm text-muted-foreground">
                                {index % 2 === 0 
                                  ? "Ideal for international movement of bulk quantities" 
                                  : "Perfect for regional distribution and time-sensitive deliveries"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={transportModesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={false} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Primary Routes</CardTitle>
                  <CardDescription>Major transportation corridors for {commodityInfo.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-4">
                        {commodityInfo.primaryRoutes.map((route, index) => (
                          <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div className="flex items-center space-x-3">
                              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{route.from}</span>
                                <span className="mx-2 text-muted-foreground">→</span>
                                <span className="font-medium">{route.to}</span>
                              </div>
                            </div>
                            <Badge variant="outline">{route.volume}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={routePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name }) => name.split(' to ')[0]}
                          >
                            {routePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Special Handling Considerations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {commodityInfo.handlingRequirements.map((req, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{req}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">
                            {index % 2 === 0 
                              ? "This requirement is essential to maintain the quality and integrity of the cargo during transportation. Specialized equipment and monitoring may be required."
                              : "Failure to implement this handling requirement may result in cargo damage, financial losses, and potential regulatory violations. MOLOCHAIN provides specialized solutions to address this need."}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Regulations Tab */}
            <TabsContent value="regulations" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Considerations</CardTitle>
                  <CardDescription>Important regulations affecting {commodityInfo.name} transportation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {commodityInfo.regulatoryConsiderations.map((regulation, index) => (
                      <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                        <h3 className="font-medium mb-2">{regulation}</h3>
                        <p className="text-sm text-muted-foreground">
                          {index % 2 === 0 
                            ? "This regulation requires careful documentation, specific handling protocols, and may vary by jurisdiction. MOLOCHAIN ensures full compliance across all shipments."
                            : "Our compliance team specializes in navigating these complex requirements, ensuring your cargo moves without delays or regulatory issues."}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 border rounded-md">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Certificate of Origin</h4>
                        <p className="text-sm text-muted-foreground">Required for customs clearance</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Quality Certification</h4>
                        <p className="text-sm text-muted-foreground">Required for regulatory compliance</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center p-3 border rounded-md">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Bill of Lading</h4>
                        <p className="text-sm text-muted-foreground">Required for all shipments</p>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sustainability Tab */}
            <TabsContent value="sustainability" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sustainability Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {commodityInfo.sustainabilityImpact}
                  </p>
                  <Separator className="my-4" />
                  <h3 className="font-medium mb-2">MOLOCHAIN Sustainability Initiatives</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Carbon offset programs specifically for {commodityInfo.name.toLowerCase()} transportation</li>
                    <li>Optimized routing to reduce fuel consumption and emissions</li>
                    <li>Sustainable packaging solutions designed for this commodity type</li>
                    <li>Partnership with eco-certified suppliers and carriers</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environmental Considerations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-1">Carbon Footprint</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      This commodity type has a {commodityInfo.sustainabilityImpact.includes("high") ? "significant" : "moderate"} carbon footprint across its supply chain.
                    </p>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className={`bg-${commodityInfo.sustainabilityImpact.includes("high") ? "red" : commodityInfo.sustainabilityImpact.includes("moderate") ? "amber" : "green"}-500 h-2.5 rounded-full`} style={{ width: commodityInfo.sustainabilityImpact.includes("high") ? '80%' : commodityInfo.sustainabilityImpact.includes("moderate") ? '50%' : '30%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-1">Waste Reduction</h3>
                    <p className="text-sm text-muted-foreground">
                      MOLOCHAIN implements specialized waste reduction strategies for {commodityInfo.name.toLowerCase()} transportation, including recyclable packaging, optimized container usage, and digital documentation to minimize paper waste.
                    </p>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-1">Sustainable Alternatives</h3>
                    <p className="text-sm text-muted-foreground">
                      We offer eco-friendly alternatives for transporting this commodity, including biofuel-powered vessels, electric ground transportation, and carbon-neutral shipping options.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Data Tab */}
            <TabsContent value="data" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Volume Trends</CardTitle>
                  <CardDescription>Historical and projected shipping volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={commodityInfo.businessCycle}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="volume" stroke="#2563eb" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Markets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {commodityInfo.primaryRoutes.map((route) => (
                        <div key={route.to} className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{route.to}</h4>
                            <p className="text-sm text-muted-foreground">Destination market</p>
                          </div>
                          <Badge variant="outline">{route.volume}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supply Origins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {commodityInfo.primaryRoutes.map((route) => (
                        <div key={route.from} className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{route.from}</h4>
                            <p className="text-sm text-muted-foreground">Supply origin</p>
                          </div>
                          <Badge variant="outline">{route.volume}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Market Trends & Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {commodityInfo.marketTrends.map((trend, index) => (
                      <div key={index} className="pb-3 border-b last:border-0">
                        <h4 className="font-medium mb-1">{trend}</h4>
                        <p className="text-sm text-muted-foreground">
                          {index % 2 === 0 
                            ? "This trend is expected to continue through the next fiscal year, creating new logistics opportunities and challenges." 
                            : "MOLOCHAIN has developed specialized solutions to address this market development, ensuring optimal efficiency for our clients."}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Chat Tab */}
            <TabsContent value="chat" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{commodityInfo.name} Discussion</h2>
                    <p className="text-muted-foreground">
                      Connect with other MOLOCHAIN users to discuss best practices, market insights, and logistics strategies for {commodityInfo.name.toLowerCase()}.
                    </p>
                  </div>
                </div>
                
                <CommodityChat 
                  commodityType={commodityInfo.name} 
                  title={`${commodityInfo.name} - Live Discussion`}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}