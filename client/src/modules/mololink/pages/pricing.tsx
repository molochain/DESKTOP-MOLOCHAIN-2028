import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import {
  Check, X, Zap, Building2, Rocket, Crown, ChevronRight,
  Calculator, MessageSquare, ArrowRight, Shield, Clock, Users
} from "lucide-react";

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small businesses just getting started with logistics.",
    monthlyPrice: 49,
    yearlyPrice: 470,
    icon: <Zap className="h-6 w-6" />,
    popular: false,
    features: [
      { text: "Up to 50 shipments/month", included: true },
      { text: "Basic tracking", included: true },
      { text: "Email support", included: true },
      { text: "1 user account", included: true },
      { text: "Standard reports", included: true },
      { text: "API access", included: false },
      { text: "Custom integrations", included: false },
      { text: "Dedicated account manager", included: false }
    ]
  },
  {
    id: "professional",
    name: "Professional",
    description: "Ideal for growing businesses with expanding logistics needs.",
    monthlyPrice: 149,
    yearlyPrice: 1430,
    icon: <Building2 className="h-6 w-6" />,
    popular: true,
    features: [
      { text: "Up to 500 shipments/month", included: true },
      { text: "Advanced tracking & analytics", included: true },
      { text: "Priority email & chat support", included: true },
      { text: "Up to 10 user accounts", included: true },
      { text: "Advanced reports & dashboards", included: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: false },
      { text: "Dedicated account manager", included: false }
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with complex logistics requirements.",
    monthlyPrice: 499,
    yearlyPrice: 4790,
    icon: <Rocket className="h-6 w-6" />,
    popular: false,
    features: [
      { text: "Unlimited shipments", included: true },
      { text: "Real-time tracking & AI insights", included: true },
      { text: "24/7 phone, email & chat support", included: true },
      { text: "Unlimited user accounts", included: true },
      { text: "Custom reports & analytics", included: true },
      { text: "Full API access", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true }
    ]
  }
];

const faqs = [
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a 14-day free trial on all plans. No credit card required to start."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer: "Absolutely. Contact our sales team for custom pricing and tailored solutions for your organization."
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20" data-testid="badge-pricing">
              <Calculator className="h-3 w-3 mr-1" />
              Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-pricing-title">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-pricing-subtitle">
              Choose the plan that best fits your business needs. 
              All plans include access to our core logistics platform.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>Monthly</span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                data-testid="switch-billing-period"
              />
              <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
                Yearly
                <Badge variant="secondary" className="ml-2">Save 20%</Badge>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">
                      ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {isYearly && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed annually (${plan.yearlyPrice}/year)
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full gap-2" 
                    variant={plan.popular ? "default" : "outline"}
                    data-testid={`button-select-${plan.id}`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">256-bit SSL encryption for all transactions</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">14-Day Free Trial</h3>
                <p className="text-sm text-muted-foreground">Try any plan free, no credit card required</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Cancel Anytime</h3>
                <p className="text-sm text-muted-foreground">No long-term contracts or commitments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} data-testid={`card-faq-${index}`}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Need a Custom Solution?</h2>
            <p className="text-lg opacity-90 mb-8">
              Our enterprise team can create a tailored package for your organization's specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-contact-sales">
                  Contact Sales
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
