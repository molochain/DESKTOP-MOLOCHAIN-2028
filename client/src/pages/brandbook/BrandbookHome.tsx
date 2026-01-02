import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';
import { 
  Palette, 
  Type, 
  Image, 
  Component, 
  Code2, 
  BookOpen,
  Download,
  ArrowRight,
  Calendar
} from "lucide-react";
import { defaultMolochainBrand } from "@shared/brand-schema";

export default function BrandbookHome() {
  const { t } = useTranslation();
  
  const brandSections = [
    {
      title: t('brandbook.sections.colors.title'),
      description: t('brandbook.sections.colors.description'),
      icon: Palette,
      href: "/brandbook/colors",
      count: t('brandbook.counts.colors', { count: defaultMolochainBrand.colors.length }),
    },
    {
      title: t('brandbook.sections.typography.title'),
      description: t('brandbook.sections.typography.description'),
      icon: Type,
      href: "/brandbook/typography",
      count: t('brandbook.counts.typefaces', { count: defaultMolochainBrand.typography.length }),
    },
    {
      title: t('brandbook.sections.logos.title'),
      description: t('brandbook.sections.logos.description'),
      icon: Image,
      href: "/brandbook/logos",
      count: t('brandbook.counts.logoSets', { count: defaultMolochainBrand.logos.length }),
    },
    {
      title: t('brandbook.sections.components.title'),
      description: t('brandbook.sections.components.description'),
      icon: Component,
      href: "/brandbook/components",
      count: t('brandbook.sections.components.count'),
    },
    {
      title: t('brandbook.sections.tokens.title'),
      description: t('brandbook.sections.tokens.description'),
      icon: Code2,
      href: "/brandbook/tokens",
      count: t('brandbook.counts.tokens', { count: defaultMolochainBrand.designTokens.length }),
    },
    {
      title: t('brandbook.sections.guidelines.title'),
      description: t('brandbook.sections.guidelines.description'),
      icon: BookOpen,
      href: "/brandbook/guidelines",
      count: t('brandbook.counts.guides', { count: defaultMolochainBrand.guidelines.length }),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            <Calendar className="mr-1 h-3 w-3" />
            {t('brandbook.version', { version: defaultMolochainBrand.version })} • {t('brandbook.updated', { date: defaultMolochainBrand.lastUpdated })}
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {defaultMolochainBrand.name} {t('brandbook.title')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
            {defaultMolochainBrand.description}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" data-testid="button-download-kit">
              <a href="/api/brand/download-kit" download>
                <Download className="mr-2 h-4 w-4" />
                {t('brandbook.buttons.downloadBrandKit')}
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild data-testid="button-view-guidelines">
              <Link href="/brandbook/guidelines">
                <BookOpen className="mr-2 h-4 w-4" />
                {t('brandbook.buttons.viewGuidelines')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {brandSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card 
                className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                data-testid={`card-brand-${section.title.toLowerCase()}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <section.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge variant="secondary">{section.count}</Badge>
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {section.title}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{t('brandbook.quickReference.title')}</h2>
                <p className="text-blue-100">{t('brandbook.quickReference.description')}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {defaultMolochainBrand.colors.slice(0, 6).map((color) => (
                  <div 
                    key={color.name}
                    className="group relative"
                    title={`${color.name}: ${color.hex}`}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg shadow-lg border-2 border-white/20 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-blue-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {color.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('brandbook.cards.brandName')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{defaultMolochainBrand.name}</p>
              <p className="text-sm text-slate-500 mt-2">{defaultMolochainBrand.tagline}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('brandbook.cards.primaryColor')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg"
                  style={{ backgroundColor: defaultMolochainBrand.colors[0].hex }}
                />
                <div>
                  <p className="font-mono font-bold">{defaultMolochainBrand.colors[0].hex}</p>
                  <p className="text-sm text-slate-500">{defaultMolochainBrand.colors[0].name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('brandbook.cards.primaryFont')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ fontFamily: defaultMolochainBrand.typography[0].family }}>
                Aa
              </p>
              <p className="text-sm text-slate-500 mt-2">{defaultMolochainBrand.typography[0].family}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
