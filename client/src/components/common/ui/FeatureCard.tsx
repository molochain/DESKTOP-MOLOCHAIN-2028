import { ReactNode } from "react";
import { ChevronRight, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export interface FeatureItem {
  title: string;
  description?: string;
}

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features?: FeatureItem[];
  href?: string;
  linkLabel?: string;
  colorClass?: string;
  className?: string;
  testId?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  features,
  href,
  linkLabel = "Learn more",
  colorClass = "bg-gradient-to-r from-blue-500 to-blue-600",
  className,
  testId = "feature-card",
}: FeatureCardProps) {
  return (
    <Card
      className={cn("hover:shadow-lg transition-shadow", className)}
      data-testid={testId}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-white",
              colorClass
            )}
            data-testid={`${testId}-icon`}
          >
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg" data-testid={`${testId}-title`}>
              {title}
            </CardTitle>
            <CardDescription data-testid={`${testId}-description`}>
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {features && features.length > 0 && (
          <ul className="space-y-2" data-testid={`${testId}-features`}>
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm"
                data-testid={`${testId}-feature-${index}`}
              >
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">{feature.title}</span>
                  {feature.description && (
                    <p className="text-muted-foreground">{feature.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {href && (
          <Button
            variant="ghost"
            className="w-full justify-between"
            data-testid={`${testId}-link`}
            asChild
          >
            <Link href={href}>
              {linkLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
