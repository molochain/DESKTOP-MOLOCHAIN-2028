import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { getTagColor } from "@/lib/tagColors";
import { AnimatedCard } from "@/components/ui/animated-card";
import { RippleButton } from "@/components/ui/ripple-button";
import { iconAnimation } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  tags?: string[];
}

const ServiceCard = ({ 
  id, 
  title, 
  description, 
  icon, 
  features,
  tags
}: ServiceCardProps) => {
  return (
    <AnimatedCard 
      effect="lift" 
      clickEffect="push"
      className="h-full border"
    >
      <CardHeader>
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group">
          <div className={cn(iconAnimation({ effect: 'scale' }))}>
            {icon}
          </div>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-600">
          {features.slice(0, 4).map((feature, index) => (
            <li 
              key={index} 
              className="flex items-center opacity-0 animate-fadeIn group"
              style={{ 
                animationDelay: `${index * 100 + 300}ms`, 
                animationFillMode: 'forwards' 
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2 group-hover:bg-primary group-hover:scale-125 transition-all duration-300" 
              />
              <span className="group-hover:text-gray-900 transition-colors">
                {feature}
              </span>
            </li>
          ))}
        </ul>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            {tags.map((tag, index) => {
              const { bg, text } = getTagColor(tag);
              return (
                <Badge
                  key={tag}
                  className={`${bg} ${text} opacity-0 animate-fadeIn transition-all hover:scale-105 hover:shadow-sm`}
                  style={{ 
                    animationDelay: `${(index + 5) * 100}ms`, 
                    animationFillMode: 'forwards',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        )}
        <Link href={`/services/${id}`} className="block mt-4">
          <RippleButton 
            variant="outline" 
            className="w-full" 
            effect="scale"
          >
            Learn More
          </RippleButton>
        </Link>
      </CardContent>
    </AnimatedCard>
  );
};

export default ServiceCard;