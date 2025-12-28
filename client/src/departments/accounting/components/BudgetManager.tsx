import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export function BudgetManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Budget planning and management tools</p>
      </CardContent>
    </Card>
  );
}