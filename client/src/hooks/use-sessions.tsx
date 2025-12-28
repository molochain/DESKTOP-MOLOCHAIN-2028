import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Session {
  id: string;
  lastActivity: string;
  createdAt?: string;
}

export function useSessions() {
  const { toast } = useToast();

  const {
    data: sessions,
    error,
    isLoading,
  } = useQuery<Session[]>({
    queryKey: ["/api/auth/sessions"],
    queryFn: async () => {
      const res = await fetch("/api/auth/sessions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to terminate session");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/auth/sessions"]);
      toast({
        title: "Session terminated",
        description: "The session has been successfully terminated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to terminate session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    terminateSession: terminateSessionMutation.mutate,
  };
}
