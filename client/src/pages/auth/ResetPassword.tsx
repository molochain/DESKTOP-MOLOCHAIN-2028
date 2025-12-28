import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { fetchWithCsrf } from "@/lib/csrf";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "wouter";
import { Loader2, ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

// Password reset form schema
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password cannot exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = React.useState<string>("");

  // Extract token from URL on component mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or expired.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Mutation for password reset
  const resetPasswordMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!token) {
        throw new Error("Reset token is missing");
      }

      const response = await fetchWithCsrf("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to reset password"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    try {
      await resetPasswordMutation.mutateAsync(values);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Password reset error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <img 
            src="/molochain-logo.png" 
            alt="Logo" 
            className="h-12 w-auto" 
          />
        </div>
        
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">
              Set New Password
            </CardTitle>
            <CardDescription className="text-center">
              Create a new secure password for your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your new password"
                          type="password"
                          autoComplete="new-password"
                          disabled={resetPasswordMutation.isPending || !token}
                          className="border-gray-300 focus:ring-primary focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm your new password"
                          type="password"
                          autoComplete="new-password"
                          disabled={resetPasswordMutation.isPending || !token}
                          className="border-gray-300 focus:ring-primary focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 h-11 transition-all duration-200 transform hover:translate-y-[-2px]"
                    disabled={resetPasswordMutation.isPending || !token}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Setting New Password...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Set New Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 border-t pt-6">
            <div className="text-sm text-center">
              <Link href="/login" className="text-primary font-medium hover:underline transition-colors inline-flex items-center">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Login
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Protected by industry-leading security practices</p>
        </div>
      </div>
    </div>
  );
}