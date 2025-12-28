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

const formSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  company: z.string().optional(),
  phone: z.string().optional(),
});

const Register = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { registerMutation } = useAuth();

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
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
        variant: "default",
      });
      setLocation("/login");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Registration error:", error);
      }
      // Error is already handled by the mutation's onError callback
      // which shows a toast notification
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
              Create your account to access the MoloChain platform
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
                        {t("auth.register.username") || "Username"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="johndoe123" 
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
                          placeholder="john@example.com" 
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
                          placeholder="Password123!" 
                          className="border-gray-300 focus:ring-primary focus:border-primary"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Min 8 chars, uppercase, lowercase, number & special character
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
                          placeholder={t("auth.register.fullName")} 
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
                          placeholder={t("auth.register.company")} 
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
                          placeholder={t("auth.register.phone")} 
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
          <p>Protected by industry-leading security practices</p>
        </div>
      </div>
    </div>
  );
};

export default Register;