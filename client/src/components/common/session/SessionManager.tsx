import { useSessions } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function SessionManager() {
  const { sessions, isLoading, terminateSession } = useSessions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across different devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions?.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Last activity:{" "}
                  {formatDistanceToNow(new Date(session.lastActivity), {
                    addSuffix: true,
                  })}
                </p>
                {session.createdAt && (
                  <p className="text-sm text-muted-foreground">
                    Created:{" "}
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => terminateSession(session.id)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Terminate
              </Button>
            </div>
          ))}
          {sessions?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active sessions found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
