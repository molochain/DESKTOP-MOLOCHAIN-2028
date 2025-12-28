import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Palette, Type, Image, Component, Code2, BookOpen, ArrowRight, Download } from "lucide-react";

const brandSections = [
  {
    title: "Colors",
    description: "Brand color palette with hex, RGB, and HSL values",
    icon: Palette,
    href: "/brandbook/colors",
  },
  {
    title: "Typography", 
    description: "Font families and type scale specifications",
    icon: Type,
    href: "/brandbook/typography",
  },
  {
    title: "Logos",
    description: "Logo variations and usage guidelines",
    icon: Image,
    href: "/brandbook/logos",
  },
  {
    title: "Components",
    description: "UI component library with code examples",
    icon: Component,
    href: "/brandbook/components",
  },
  {
    title: "Design Tokens",
    description: "Spacing, shadows, and animation values",
    icon: Code2,
    href: "/brandbook/tokens",
  },
  {
    title: "Guidelines",
    description: "Usage rules and best practices",
    icon: BookOpen,
    href: "/brandbook/guidelines",
  },
];

export function MarketingBrandingDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Marketing & Branding</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage brand assets, guidelines, and marketing materials
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild data-testid="button-download-brand-kit">
            <a href="/api/brand/download-kit" download>
              <Download className="mr-2 h-4 w-4" />
              Download Brand Kit
            </a>
          </Button>
          <Button asChild data-testid="button-view-brandbook">
            <Link href="/brandbook">
              View Full Brand Book
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Molochain Brand Book</h2>
              <p className="text-blue-100">
                Complete brand guidelines, assets, and design system documentation
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              v1.0.0
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brandSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group" data-testid={`card-brand-${section.title.toLowerCase()}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <section.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg flex items-center">
                    {section.title}
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Primary Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600" />
              <div>
                <p className="font-mono font-bold">#2563EB</p>
                <p className="text-sm text-slate-500">Molochain Blue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Primary Font</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Aa</p>
            <p className="text-sm text-slate-500">Inter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Brand Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">13</p>
            <p className="text-sm text-slate-500">Colors • 2 Fonts • 2 Logos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MarketingBrandingDashboard;
