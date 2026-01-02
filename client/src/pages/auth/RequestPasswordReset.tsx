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
import { Loader2, Mail, ArrowLeft, UserPlus } from "lucide-react";

type FormValues = {
  email: string;
};

export default function RequestPasswordReset() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const formSchema = z.object({
    email: z.string().email(t("auth.passwordReset.validation.emailInvalid")),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetchWithCsrf("/api/auth/request-reset", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("auth.passwordReset.toast.requestFailed"));
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("auth.passwordReset.toast.successTitle"),
        description: t("auth.passwordReset.toast.successDescription"),
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t("auth.passwordReset.toast.failedTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await requestResetMutation.mutateAsync(values);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Password reset request error:", error);
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
              {t("auth.passwordReset.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.passwordReset.description")}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {t("auth.passwordReset.emailLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("auth.passwordReset.emailPlaceholder")}
                          type="email"
                          autoComplete="email"
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
                    disabled={requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("auth.passwordReset.sendingButton")}
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        {t("auth.passwordReset.submitButton")}
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
                {t("auth.passwordReset.backToLogin")}
              </Link>
            </div>
            <div className="text-sm text-center">
              <span className="text-muted-foreground">
                {t("auth.passwordReset.noAccount")}{" "}
              </span>
              <Link href="/register" className="text-primary font-medium hover:underline transition-colors inline-flex items-center">
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                {t("auth.passwordReset.signUp")}
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("auth.passwordReset.securityNotice")}</p>
        </div>
      </div>
    </div>
  );
}
