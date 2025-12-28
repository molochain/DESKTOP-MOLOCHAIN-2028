import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  BookOpen, 
  Shield,
  Layers,
  Globe,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  FileCode,
  FilePlus,
  Eye
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WhitepaperSection() {
  const [downloading, setDownloading] = useState(false);
  const [viewCount, setViewCount] = useState(12847);
  const { toast } = useToast();

  const handleDownload = (format: string) => {
    setDownloading(true);
    
    // Simulate download
    setTimeout(() => {
      setDownloading(false);
      setViewCount(prev => prev + 1);
      toast({
        title: "Download Started",
        description: `MOLOCHAIN Whitepaper (${format.toUpperCase()}) is being downloaded.`,
      });
    }, 1000);
  };

  const whitepaperHighlights = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Smart Contract Architecture",
      description: "Detailed technical specifications of our platform implementation"
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "Token Economics",
      description: "Complete tokenomics model with burn mechanics and staking rewards"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Market Analysis",
      description: "$9.1 trillion logistics market opportunity breakdown"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Growth Strategy",
      description: "5-year roadmap to capture 1% of global logistics market"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Partnership Framework",
      description: "Strategic alliance model with major logistics providers"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Technology Stack",
      description: "Full technical architecture and implementation details"
    }
  ];

  const tableOfContents = [
    "1. Executive Summary",
    "2. Market Opportunity & Problem Statement",
    "3. MOLOCHAIN Solution Architecture",
    "4. Enterprise Technology Stack",
    "5. Token Economics & Distribution",
    "6. Smart Contract Implementation",
    "7. Platform Features & Services",
    "8. Go-to-Market Strategy",
    "9. Financial Projections (2025-2030)",
    "10. Team & Advisory Board",
    "11. Risk Analysis & Mitigation",
    "12. Roadmap & Milestones"
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <BookOpen className="w-3 h-3 mr-1" /> Technical Documentation
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            MOLOCHAIN Whitepaper
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive technical documentation of our enterprise-powered logistics platform,
            technology economics, and implementation roadmap
          </p>
          
          {/* View Counter */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {viewCount.toLocaleString()} views
            </span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Whitepaper Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">MOLOCHAIN</h3>
                    <p className="opacity-90">Technical Whitepaper v2.0</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">68</div>
                    <div className="text-sm opacity-90">Pages</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">2025</div>
                    <div className="text-sm opacity-90">Updated</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm opacity-90">Chapters</div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleDownload('pdf')}
                    disabled={downloading}
                    className="bg-white text-orange-600 hover:bg-white/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => handleDownload('epub')}
                    disabled={downloading}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    Download EPUB
                  </Button>
                  <Button
                    onClick={() => handleDownload('view')}
                    disabled={downloading}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Online
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">Table of Contents</h4>
                <div className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold mb-4">Key Highlights</h3>
            {whitepaperHighlights.map((highlight, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {highlight.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{highlight.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {highlight.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}

            {/* Additional Resources */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardHeader>
                <CardTitle className="text-base">Additional Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <FilePlus className="w-4 h-4 mr-2" />
                  Technical Architecture
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <FileCode className="w-4 h-4 mr-2" />
                  Smart Contract Audit
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Economic Model
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-3">
                Ready to Join the Enterprise Logistics Revolution?
              </h3>
              <p className="text-muted-foreground mb-6">
                Download our whitepaper to understand the full potential of MOLOCHAIN
                and how we're transforming the $9.1 trillion logistics industry.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => handleDownload('pdf')}>
                  <Download className="w-4 h-4 mr-2" />
                  Get Whitepaper
                </Button>
                <Button size="lg" variant="outline">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Contact Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}