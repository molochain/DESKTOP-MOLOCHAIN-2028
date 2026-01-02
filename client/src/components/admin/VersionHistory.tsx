import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Version {
  id: number;
  versionNumber: number;
  changes: Record<string, any>;
  createdAt: string;
  user: {
    id: number;
    username: string;
  };
}

interface VersionHistoryProps {
  contentType: string;
  contentId: string | number;
}

export default function VersionHistory({ contentType, contentId }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);

  const { data: versions } = useQuery<Version[]>({
    queryKey: [`/api/admin/content/${contentType}/${contentId}/history`],
    enabled: open, // Only fetch when dialog is open
  });

  function formatChanges(changes: Record<string, any>) {
    if (!changes) return '';

    if (typeof changes === 'string') {
      try {
        changes = JSON.parse(changes);
      } catch {
        return changes;
      }
    }

    return Object.entries(changes)
      .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
      .join('\n');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 hover:bg-secondary/80"
        >
          <Clock className="w-4 h-4" />
          <Badge variant="secondary" className="rounded-full font-semibold">
            {versions?.length || 0}
          </Badge>
          <span className="font-medium">History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View all changes made to this content
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          <div className="space-y-4">
            {versions?.map((version) => (
              <div
                key={version.id}
                className="p-4 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">
                    Version {version.versionNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(version.createdAt), 'PPpp')}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  By {version.user.username}
                </div>
                <pre className="p-2 bg-muted rounded text-sm whitespace-pre-wrap">
                  {formatChanges(version.changes) as string}
                </pre>
              </div>
            ))}
            {!versions?.length && (
              <div className="text-center text-muted-foreground py-8">
                No version history available
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}