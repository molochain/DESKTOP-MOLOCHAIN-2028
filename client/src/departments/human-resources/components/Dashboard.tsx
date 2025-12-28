import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function HRDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          HR Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Human Resources management center</p>
      </CardContent>
    </Card>
  );
}
