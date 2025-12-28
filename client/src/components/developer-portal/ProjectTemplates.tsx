import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Database, Globe, Smartphone } from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  icon: React.ReactNode;
}

interface ProjectTemplatesProps {
  onCreateProject?: (template: ProjectTemplate) => void;
  className?: string;
}

const templates: ProjectTemplate[] = [
  {
    id: 'molochain-api-client',
    name: 'MoloChain API Client',
    description: 'TypeScript client library for MoloChain logistics APIs',
    category: 'API Integration',
    difficulty: 'intermediate',
    tags: ['TypeScript', 'REST API', 'Logistics'],
    icon: <Code className="w-5 h-5" />
  },
  {
    id: 'realtime-tracking-dashboard',
    name: 'Real-time Tracking Dashboard',
    description: 'WebSocket-powered tracking dashboard with live updates',
    category: 'Web Application',
    difficulty: 'advanced',
    tags: ['React', 'WebSocket', 'Real-time'],
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'python-monitoring-system',
    name: 'Python Monitoring System',
    description: 'Commodity price monitoring with real-time alerts',
    category: 'Data Science',
    difficulty: 'intermediate',
    tags: ['Python', 'Monitoring', 'API'],
    icon: <Database className="w-5 h-5" />
  },
  {
    id: 'react-native-logistics-app',
    name: 'React Native Logistics App',
    description: 'Mobile app for shipment tracking and logistics management',
    category: 'Mobile Development',
    difficulty: 'advanced',
    tags: ['React Native', 'Mobile', 'Logistics'],
    icon: <Smartphone className="w-5 h-5" />
  }
];

export function ProjectTemplates({ onCreateProject, className }: ProjectTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const handleCreateProject = (template: ProjectTemplate) => {
    if (onCreateProject) {
      onCreateProject(template);
    }
    setSelectedTemplate(template);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Templates</h2>
          <Badge variant="outline">{templates.length} templates</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {template.icon}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {template.category}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => handleCreateProject(template)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Template "{selectedTemplate.name}" selected. Ready for project creation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}