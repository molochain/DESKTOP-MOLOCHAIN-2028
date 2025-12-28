import { Mail, Phone, MapPin, Globe, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AgentStatusIndicator from './AgentStatusIndicator';
// Agent Status interface for card component
interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
}

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    languages: string[];
    specialty: string[];
    photo?: string;
  };
  agentStatus?: AgentStatus;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, agentStatus }) => {
  const { name, role, email, phone, country, region, languages, specialty, photo } = agent;
  
  const defaultPhoto = '/client/public/container-logo.jpg';
  const photoSrc = photo || defaultPhoto;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        {/* Agent Status Indicator positioned at top right corner */}
        {agentStatus && (
          <div className="absolute top-2 right-2 z-10">
            <AgentStatusIndicator 
              status={agentStatus.status} 
              lastActive={new Date(agentStatus.lastActive)} 
              size="md" 
            />
          </div>
        )}
        
        {/* Agent Photo */}
        <div className="h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <img 
            src={photoSrc} 
            alt={`${name}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fall back to the default image if the provided one fails to load
              (e.target as HTMLImageElement).src = defaultPhoto;
            }}
          />
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Building className="h-4 w-4" />
          <span>{role}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 mt-1 text-primary" />
            <span className="break-all">{email}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 mt-1 text-primary" />
            <span>{phone}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-1 text-primary" />
            <span>{country}, {region}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 mt-1 text-primary" />
            <span>{languages.join(', ')}</span>
          </div>
          
          {specialty.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">Specialties:</h4>
              <div className="flex flex-wrap gap-1">
                {specialty.map((item, index) => (
                  <span 
                    key={index} 
                    className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" className="w-full">
          <Mail className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentCard;