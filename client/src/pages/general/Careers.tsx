import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import {
  Briefcase, MapPin, Clock, Users, TrendingUp, Globe, Heart, 
  GraduationCap, Award, Building2, ChevronRight, Send, Search
} from "lucide-react";

export default function Careers() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const benefits = useMemo(() => [
    { icon: <Globe className="h-6 w-6" />, title: t('careers.benefits.globalOpportunities.title'), description: t('careers.benefits.globalOpportunities.description') },
    { icon: <TrendingUp className="h-6 w-6" />, title: t('careers.benefits.careerGrowth.title'), description: t('careers.benefits.careerGrowth.description') },
    { icon: <Heart className="h-6 w-6" />, title: t('careers.benefits.healthWellness.title'), description: t('careers.benefits.healthWellness.description') },
    { icon: <GraduationCap className="h-6 w-6" />, title: t('careers.benefits.learningDevelopment.title'), description: t('careers.benefits.learningDevelopment.description') },
    { icon: <Users className="h-6 w-6" />, title: t('careers.benefits.teamCulture.title'), description: t('careers.benefits.teamCulture.description') },
    { icon: <Award className="h-6 w-6" />, title: t('careers.benefits.recognition.title'), description: t('careers.benefits.recognition.description') }
  ], [t]);

  const openPositions = useMemo(() => [
    {
      id: 1,
      title: t('careers.positions.seniorLogisticsCoordinator.title'),
      department: t('careers.departments.operations'),
      location: t('careers.positions.seniorLogisticsCoordinator.location'),
      type: t('careers.jobTypes.fullTime'),
      description: t('careers.positions.seniorLogisticsCoordinator.description')
    },
    {
      id: 2,
      title: t('careers.positions.fullStackDeveloper.title'),
      department: t('careers.departments.technology'),
      location: t('careers.positions.fullStackDeveloper.location'),
      type: t('careers.jobTypes.fullTime'),
      description: t('careers.positions.fullStackDeveloper.description')
    },
    {
      id: 3,
      title: t('careers.positions.businessDevelopmentManager.title'),
      department: t('careers.departments.sales'),
      location: t('careers.positions.businessDevelopmentManager.location'),
      type: t('careers.jobTypes.fullTime'),
      description: t('careers.positions.businessDevelopmentManager.description')
    },
    {
      id: 4,
      title: t('careers.positions.supplyChainAnalyst.title'),
      department: t('careers.departments.analytics'),
      location: t('careers.positions.supplyChainAnalyst.location'),
      type: t('careers.jobTypes.fullTime'),
      description: t('careers.positions.supplyChainAnalyst.description')
    },
    {
      id: 5,
      title: t('careers.positions.customerSuccessManager.title'),
      department: t('careers.departments.customerService'),
      location: t('careers.positions.customerSuccessManager.location'),
      type: t('careers.jobTypes.fullTime'),
      description: t('careers.positions.customerSuccessManager.description')
    },
    {
      id: 6,
      title: t('careers.positions.customsSpecialist.title'),
      department: t('careers.departments.compliance'),
      location: t('careers.positions.customsSpecialist.location'),
      type: t('careers.jobTypes.fullTime'),
      description: t('careers.positions.customsSpecialist.description')
    }
  ], [t]);

  const departments = useMemo(() => {
    const deptSet = new Set(openPositions.map(p => p.department));
    return ["all", ...Array.from(deptSet)];
  }, [openPositions]);

  const filteredPositions = openPositions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || position.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20" data-testid="badge-careers">
              <Briefcase className="h-3 w-3 mr-1" />
              {t('careers.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-careers-title">
              {t('careers.title')} <span className="text-primary">{t('careers.titleHighlight')}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-careers-subtitle">
              {t('careers.subtitle')}
            </p>
            <Button size="lg" className="gap-2" data-testid="button-view-positions">
              {t('careers.viewOpenPositions')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-benefits-title">{t('careers.whyWorkWithUs')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('careers.whyWorkWithUsDescription')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-benefit-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-positions-title">{t('careers.openPositions')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('careers.openPositionsDescription')}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('careers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-positions"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {departments.map(dept => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  data-testid={`button-filter-${dept}`}
                >
                  {dept === "all" ? t('careers.allDepartments') : dept}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 max-w-4xl mx-auto">
            {filteredPositions.map(position => (
              <Card key={position.id} className="hover:shadow-md transition-shadow" data-testid={`card-position-${position.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        <Badge variant="secondary">{position.department}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Button className="gap-2" data-testid={`button-apply-${position.id}`}>
                      {t('careers.applyNow')}
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPositions.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('careers.noPositionsFound')}</h3>
              <p className="text-muted-foreground">{t('careers.noPositionsFoundDescription')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">{t('careers.cta.title')}</h2>
            <p className="text-lg opacity-90 mb-8">
              {t('careers.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-contact-us">
                  {t('careers.cta.contactUs')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
