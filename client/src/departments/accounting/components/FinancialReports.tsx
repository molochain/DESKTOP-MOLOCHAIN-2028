import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function FinancialReports() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Financial Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Monthly, quarterly, and annual financial reports</p>
      </CardContent>
    </Card>
  );
}