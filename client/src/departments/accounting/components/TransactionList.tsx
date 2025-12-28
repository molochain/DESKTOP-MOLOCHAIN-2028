import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export function TransactionList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Transaction List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Recent transactions and payment history</p>
      </CardContent>
    </Card>
  );
}