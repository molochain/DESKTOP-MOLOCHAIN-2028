// Auth wrapper for MOLOLINK module
import { useUser } from "@/hooks/use-user";

export function useAuth() {
  const { user, isLoading } = useUser();
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: async (credentials: any) => {
      // Stub for login
      // Login not implemented for MOLOLINK
    },
    logout: async () => {
      // Stub for logout
      // Logout not implemented for MOLOLINK
    },
    register: async (data: any) => {
      // Stub for register
      // Register not implemented for MOLOLINK
    }
  };
}