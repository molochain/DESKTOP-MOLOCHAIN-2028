import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { fetchWithCsrf } from "@/lib/csrf";
import { useTranslation } from "react-i18next";

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

type FormValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = React.useState<string>("");
  const { t } = useTranslation();

  const formSchema = z
    .object({
      password: z
        .string()
        .min(8, t("auth.resetPassword.validation.passwordMin"))
        .max(100, t("auth.resetPassword.validation.passwordMax")),
      confirmPassword: z.string().min(1, t("auth.resetPassword.validation.confirmRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.resetPassword.validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        title: t("auth.resetPassword.toast.invalidLinkTitle"),
        description: t("auth.resetPassword.toast.invalidLinkDescription"),
        variant: "destructive",
      });
    }
  }, [toast, t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!token) {
        throw new Error(t("auth.resetPassword.toast.tokenMissing"));
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
          errorData.message || t("auth.resetPassword.toast.resetFailed")
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("auth.resetPassword.toast.successTitle"),
        description: t("auth.resetPassword.toast.successDescription"),
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.resetPassword.toast.failedTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
              {t("auth.resetPassword.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.resetPassword.description")}
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
                        {t("auth.resetPassword.newPasswordLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
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
                        {t("auth.resetPassword.confirmPasswordLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
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
                        {t("auth.resetPassword.settingButton")}
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        {t("auth.resetPassword.submitButton")}
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
                {t("auth.resetPassword.backToLogin")}
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("auth.resetPassword.securityNotice")}</p>
        </div>
      </div>
    </div>
  );
}
