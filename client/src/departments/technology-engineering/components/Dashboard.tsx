import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";

export function TechDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Technology Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Technology & Engineering management center</p>
      </CardContent>
    </Card>
  );
}
