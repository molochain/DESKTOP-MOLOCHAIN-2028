import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  Globe2,
  Shield,
  Rocket,
  Users,
  CheckCircle,
  ArrowRight,
  Copy,
  Trophy,
  Target,
  BarChart3,
  Calendar,
  Heart,
  Wallet,
  CreditCard,
  Bitcoin,
  Building2,
  Mail,
  Phone,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import InvestorCharts from "@/components/investor/InvestorCharts";
import WhitepaperSection from "@/components/WhitepaperSection";

const Investor = () => {
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, wallet: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(wallet);
    toast({
      title: "Copied to clipboard",
      description: `${wallet} address copied successfully`,
    });
    setTimeout(() => setCopiedWallet(null), 3000);
  };

  const investmentTiers = [
    {
      tier: "Seed Investor",
      amount: "$50K - $250K",
      benefits: [
        "Early MOLOCHAIN token allocation",
        "Advisory board opportunity",
        "Quarterly investor calls",
        "Priority platform access"
      ],
      allocation: "2x token bonus"
    },
    {
      tier: "Strategic Partner",
      amount: "$250K - $1M",
      benefits: [
        "Larger MOLOCHAIN token allocation",
        "Board observer rights",
        "Monthly strategy sessions",
        "Co-marketing opportunities",
        "API priority access"
      ],
      allocation: "3x token bonus"
    },
    {
      tier: "Lead Investor",
      amount: "$1M+",
      benefits: [
        "Maximum MOLOCHAIN allocation",
        "Board seat opportunity",
        "Weekly executive access",
        "Strategic partnership rights",
        "Custom integration support"
      ],
      allocation: "5x token bonus"
    }
  ];

  const donationOptions = [
    {
      method: "Bank Transfer",
      icon: <Building2 className="w-6 h-6" />,
      details: [
        { label: "Bank Name", value: "International Logistics Bank" },
        { label: "IBAN", value: "GB29 NWBK 6016 1331 9268 19" },
        { label: "SWIFT/BIC", value: "NWBKGB2L" },
        { label: "Account Name", value: "MoloChain Foundation" }
      ]
    },
    {
      method: "Cryptocurrency",
      icon: <Bitcoin className="w-6 h-6" />,
      wallets: [
        { currency: "Bitcoin (BTC)", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network: "Bitcoin" },
        { currency: "Ethereum (ETH)", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", network: "ERC-20" },
        { currency: "USDT", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", network: "ERC-20/TRC-20" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4" variant="outline">
              <DollarSign className="w-3 h-3 mr-1" /> Investment Opportunity
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join the Blockchain Logistics Revolution
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Be part of transforming the $9.1 trillion global logistics industry with MoloChain's 
              blockchain-powered Super-App and MOLOCHAIN token ecosystem
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <Rocket className="w-5 h-5" />
                Download Pitch Deck
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Meeting
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Market Size", value: "$9.1T", desc: "Global Logistics Industry" },
            { label: "Growth Rate", value: "50%", desc: "Blockchain CAGR 2024-2030" },
            { label: "Revenue Target", value: "$10M+", desc: "Year 3 Projection" },
            { label: "Token Supply", value: "1B MOLOCHAIN", desc: "Total Supply" }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center hover:shadow-xl transition-all">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                  <div className="font-semibold mb-1">{metric.label}</div>
                  <div className="text-sm text-muted-foreground">{metric.desc}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Investment & Support Tabs */}
      <section className="py-16 container mx-auto px-4">
        <Tabs defaultValue="investment" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="investment">Investment Opportunities</TabsTrigger>
            <TabsTrigger value="donation">Support & Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="investment" className="mt-8">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Investment Tiers</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Choose your investment level and join us in building the future of global logistics
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {investmentTiers.map((tier, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all">
                      <CardHeader>
                        <CardTitle>{tier.tier}</CardTitle>
                        <CardDescription className="text-2xl font-bold text-primary">
                          {tier.amount}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge className="mb-4" variant="secondary">
                          {tier.allocation}
                        </Badge>
                        <ul className="space-y-2">
                          {tier.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-6" variant="outline">
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Secure Investment Process</h3>
                      <p className="text-muted-foreground mb-4">
                        All investments are processed through secure, compliant channels with full 
                        legal documentation and smart contract protection.
                      </p>
                      <div className="flex gap-4">
                        <Button size="sm" className="gap-2">
                          <Mail className="w-4 h-4" />
                          Contact: invest@molochain.com
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Phone className="w-4 h-4" />
                          Call: +90 212 547 92 47
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donation" className="mt-8">
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Support Our Mission</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Help us accelerate the MoloChain mission. Every contribution drives us closer to 
                  building a fair, transparent logistics ecosystem.
                </p>
              </div>

              <Alert className="max-w-3xl mx-auto">
                <Heart className="w-4 h-4" />
                <AlertDescription>
                  Your donations support development, community building, and global expansion of the 
                  MoloChain ecosystem. All contributions are tax-deductible where applicable.
                </AlertDescription>
              </Alert>

              {donationOptions.map((option, index) => (
                <Card key={index} className="max-w-3xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {option.icon}
                      {option.method}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {option.details ? (
                      <div className="space-y-3">
                        {option.details.map((detail, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                            <span className="text-sm font-medium">{detail.label}:</span>
                            <div className="flex items-center gap-2">
                              <code className="text-sm bg-background px-2 py-1 rounded">
                                {detail.value}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(detail.value, detail.label)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : option.wallets ? (
                      <div className="space-y-4">
                        {option.wallets.map((wallet, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{wallet.currency}</div>
                                <div className="text-xs text-muted-foreground">Network: {wallet.network}</div>
                              </div>
                              <Button
                                size="sm"
                                variant={copiedWallet === wallet.currency ? "secondary" : "outline"}
                                onClick={() => copyToClipboard(wallet.address, wallet.currency)}
                              >
                                {copiedWallet === wallet.currency ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                  </>
                                )}
                              </Button>
                            </div>
                            <code className="text-xs bg-secondary/20 p-2 rounded block break-all">
                              {wallet.address}
                            </code>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}

              <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Institutional Donations</h3>
                    <p className="text-muted-foreground mb-4">
                      For large donations or institutional support, please contact our team directly
                    </p>
                    <Button className="gap-2">
                      <Mail className="w-4 h-4" />
                      Contact: donate@molochain.com
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Why Invest Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Target className="w-3 h-3 mr-1" /> Why MoloChain
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Why Invest in MoloChain?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Massive Market",
                description: "$9.1T logistics industry ripe for disruption with only 1% digitization"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Blockchain First",
                description: "Smart contracts eliminate intermediaries and reduce costs by 40%"
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Clear ROI Path",
                description: "Break-even Year 2, $10M+ revenue Year 3, 5x potential returns"
              },
              {
                icon: <Globe2 className="w-6 h-6" />,
                title: "Global Reach",
                description: "Targeting worldwide logistics networks across all continents"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Strong Team",
                description: "Experienced logistics and blockchain experts with proven track records"
              },
              {
                icon: <Rocket className="w-6 h-6" />,
                title: "First Mover",
                description: "Leading the blockchain logistics revolution with innovative solutions"
              }
            ].map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      {reason.icon}
                    </div>
                    <CardTitle className="text-lg">{reason.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Projections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <BarChart3 className="w-3 h-3 mr-1" /> Financial Projections
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Growth Trajectory 2025-2028</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conservative projections based on capturing just 1% of the addressable market
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {[
              { year: "2025", revenue: "$0.5M", users: "10K", transactions: "50K" },
              { year: "2026", revenue: "$2M", users: "50K", transactions: "500K" },
              { year: "2027", revenue: "$10M", users: "200K", transactions: "2M" },
              { year: "2028", revenue: "$50M", users: "1M", transactions: "10M" }
            ].map((projection, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{projection.year}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-xl font-bold">{projection.revenue}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{projection.users}</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{projection.transactions}</div>
                    <div className="text-xs text-muted-foreground">Transactions</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">MOLOCHAIN Token Economics</h3>
                  <p className="text-sm text-muted-foreground">
                    Deflationary model with transaction fees burned, increasing token value over time
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Charts Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <BarChart3 className="w-3 h-3 mr-1" /> Advanced Analytics
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Interactive Financial Insights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore detailed projections, token distribution, and market growth trajectories
            </p>
          </div>
          <InvestorCharts />
        </div>
      </section>

      {/* Whitepaper Section */}
      <WhitepaperSection />

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-primary/80 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Join the Revolution?</h2>
            <p className="text-lg mb-6 opacity-90">
              Be part of the future of global logistics. Join MoloChain today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="gap-2">
                <DollarSign className="w-5 h-5" />
                Invest Now
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <ArrowRight className="w-5 h-5" />
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Investor;