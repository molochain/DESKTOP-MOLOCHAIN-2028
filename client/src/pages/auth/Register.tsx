import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { 
  Loader2, 
  User, 
  Lock, 
  AtSign, 
  Building, 
  Phone, 
  UserPlus,
  ArrowLeft
} from "lucide-react";
import { checkAndRedirectToAuth } from "@/lib/authRedirect";

const createFormSchema = (t: (key: string) => string) => z.object({
  username: z.string()
    .min(3, t("auth.register.validation.usernameMin"))
    .max(50, t("auth.register.validation.usernameMax"))
    .regex(/^[a-zA-Z0-9_-]+$/, t("auth.register.validation.usernameFormat")),
  email: z.string()
    .email(t("auth.register.validation.emailInvalid"))
    .min(1, t("auth.register.validation.emailRequired")),
  password: z.string()
    .min(8, t("auth.register.validation.passwordMin"))
    .regex(/[A-Z]/, t("auth.register.validation.passwordUppercase"))
    .regex(/[a-z]/, t("auth.register.validation.passwordLowercase"))
    .regex(/[0-9]/, t("auth.register.validation.passwordNumber"))
    .regex(/[!@#$%^&*(),.?":{}|<>]/, t("auth.register.validation.passwordSpecial")),
  fullName: z.string().min(2, t("auth.register.validation.fullNameMin")),
  company: z.string().optional(),
  phone: z.string().optional(),
});

const Register = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { registerMutation } = useAuth();

  const formSchema = createFormSchema(t);

  useEffect(() => {
    checkAndRedirectToAuth('/register');
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      company: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await registerMutation.mutateAsync(values);
      toast({
        title: t("auth.register.toast.success"),
        description: t("auth.register.toast.successDescription"),
        variant: "default",
      });
      setLocation("/login");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Registration error:", error);
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
              {t("auth.register.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.register.description")}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {t("auth.register.username")}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("auth.register.usernamePlaceholder")} 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                        {t("auth.register.email")}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder={t("auth.register.emailPlaceholder")} 
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        {t("auth.register.password")}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={t("auth.register.passwordPlaceholder")} 
                          className="border-gray-300 focus:ring-primary focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("auth.register.passwordHint")}
                      </p>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {t("auth.register.fullName")}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("auth.register.fullNamePlaceholder")} 
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
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {t("auth.register.company")}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("auth.register.companyPlaceholder")} 
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {t("auth.register.phone")}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("auth.register.phonePlaceholder")} 
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
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("auth.register.creating")}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        {t("auth.register.submit")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 border-t pt-6">
            <div className="text-sm text-center">
              <span className="text-muted-foreground">
                {t("auth.register.haveAccount")}{" "}
              </span>
              <Link href="/login" className="text-primary font-medium hover:underline transition-colors inline-flex items-center">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {t("auth.register.login")}
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("auth.register.securityNotice")}</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
