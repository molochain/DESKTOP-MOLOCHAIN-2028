import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Users, User, Building } from 'lucide-react';

interface HierarchyNode {
  id: string;
  name: string;
  type: 'organization' | 'department' | 'person';
  role?: string;
  children?: HierarchyNode[];
}

export function IdentityHierarchy() {
  const hierarchy: HierarchyNode = {
    id: '1',
    name: 'MoloChain Global',
    type: 'organization',
    children: [
      {
        id: '2',
        name: 'Operations',
        type: 'department',
        children: [
          { id: '3', name: 'John Smith', type: 'person', role: 'Director' },
          { id: '4', name: 'Jane Doe', type: 'person', role: 'Manager' },
          { id: '5', name: 'Bob Wilson', type: 'person', role: 'Coordinator' }
        ]
      },
      {
        id: '6',
        name: 'Technology',
        type: 'department',
        children: [
          { id: '7', name: 'Alice Johnson', type: 'person', role: 'CTO' },
          { id: '8', name: 'Charlie Brown', type: 'person', role: 'Lead Engineer' },
          { id: '9', name: 'Eve Davis', type: 'person', role: 'Developer' }
        ]
      },
      {
        id: '10',
        name: 'Finance',
        type: 'department',
        children: [
          { id: '11', name: 'Frank Miller', type: 'person', role: 'CFO' },
          { id: '12', name: 'Grace Lee', type: 'person', role: 'Accountant' }
        ]
      }
    ]
  };

  const renderNode = (node: HierarchyNode, depth: number = 0) => {
    const Icon = node.type === 'organization' ? Building : node.type === 'department' ? Users : User;
    const indent = depth * 24;

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer transition-colors"
          style={{ marginLeft: `${indent}px` }}
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{node.name}</span>
          {node.role && (
            <Badge variant="outline" className="ml-auto">
              {node.role}
            </Badge>
          )}
          {node.children && node.children.length > 0 && (
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          )}
        </div>
        {node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Hierarchy</CardTitle>
      </CardHeader>
      <CardContent>
        {renderNode(hierarchy)}
      </CardContent>
    </Card>
  );
}