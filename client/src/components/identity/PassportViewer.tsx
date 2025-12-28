import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Globe, Shield, Calendar } from 'lucide-react';

export function PassportViewer({ passport }: { passport?: any }) {
  if (!passport) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No passport data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Digital Passport
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{passport.name || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Nationality</p>
            <p className="text-sm text-muted-foreground">{passport.nationality || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Issue Date</p>
            <p className="text-sm text-muted-foreground">{passport.issueDate || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Expiry Date</p>
            <p className="text-sm text-muted-foreground">{passport.expiryDate || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <Badge variant="outline">Verified</Badge>
          <Badge className="bg-green-500">Active</Badge>
        </div>
      </CardContent>
    </Card>
  );
}