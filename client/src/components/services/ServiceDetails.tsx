import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceDetailsProps {
  service: any;
  onClose?: () => void;
}

export function ServiceDetails({ service, onClose }: ServiceDetailsProps) {
  if (!service) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Select a service to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Category</h4>
          <p className="text-sm text-muted-foreground">{service.category}</p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Pricing</h4>
          <p className="text-sm text-muted-foreground">{service.price || 'Contact for pricing'}</p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Status</h4>
          <p className="text-sm text-muted-foreground">{service.status || 'Active'}</p>
        </div>
      </CardContent>
    </Card>
  );
}