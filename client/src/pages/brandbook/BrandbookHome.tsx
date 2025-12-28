import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
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

const brandSections = [
  {
    title: "Colors",
    description: "Brand color palette with primary, secondary, and semantic colors",
    icon: Palette,
    href: "/brandbook/colors",
    count: `${defaultMolochainBrand.colors.length} colors`,
  },
  {
    title: "Typography",
    description: "Font families, weights, and type scale specifications",
    icon: Type,
    href: "/brandbook/typography",
    count: `${defaultMolochainBrand.typography.length} typefaces`,
  },
  {
    title: "Logos",
    description: "Logo variations, usage guidelines, and downloadable assets",
    icon: Image,
    href: "/brandbook/logos",
    count: `${defaultMolochainBrand.logos.length} logo sets`,
  },
  {
    title: "Components",
    description: "UI component library with live examples and code snippets",
    icon: Component,
    href: "/brandbook/components",
    count: "20+ components",
  },
  {
    title: "Design Tokens",
    description: "Spacing, border radius, shadows, and animation values",
    icon: Code2,
    href: "/brandbook/tokens",
    count: `${defaultMolochainBrand.designTokens.length} tokens`,
  },
  {
    title: "Guidelines",
    description: "Usage rules, do's and don'ts, and best practices",
    icon: BookOpen,
    href: "/brandbook/guidelines",
    count: `${defaultMolochainBrand.guidelines.length} guides`,
  },
];

export default function BrandbookHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            <Calendar className="mr-1 h-3 w-3" />
            Version {defaultMolochainBrand.version} • Updated {defaultMolochainBrand.lastUpdated}
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {defaultMolochainBrand.name} Brand Book
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
            {defaultMolochainBrand.description}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" data-testid="button-download-kit">
              <a href="/api/brand/download-kit" download>
                <Download className="mr-2 h-4 w-4" />
                Download Brand Kit
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild data-testid="button-view-guidelines">
              <Link href="/brandbook/guidelines">
                <BookOpen className="mr-2 h-4 w-4" />
                View Guidelines
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
                <h2 className="text-2xl font-bold mb-2">Quick Color Reference</h2>
                <p className="text-blue-100">The core Molochain color palette at a glance</p>
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
              <CardTitle className="text-lg">Brand Name</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{defaultMolochainBrand.name}</p>
              <p className="text-sm text-slate-500 mt-2">{defaultMolochainBrand.tagline}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primary Color</CardTitle>
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
              <CardTitle className="text-lg">Primary Font</CardTitle>
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
