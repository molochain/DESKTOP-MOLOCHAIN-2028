import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, MapPin, Users } from 'lucide-react';

export function BirthCertificateViewer({ document }: { document?: any }) {
  if (!document) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No birth certificate data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Birth Certificate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Full Name</p>
            <p className="text-sm text-muted-foreground">{document.fullName || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Date of Birth</p>
            <p className="text-sm text-muted-foreground">{document.dateOfBirth || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Place of Birth</p>
            <p className="text-sm text-muted-foreground">{document.placeOfBirth || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Parents</p>
            <p className="text-sm text-muted-foreground">{document.parents || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <Badge variant="outline">Official Document</Badge>
          <Badge className="bg-green-500">Verified</Badge>
        </div>
      </CardContent>
    </Card>
  );
}