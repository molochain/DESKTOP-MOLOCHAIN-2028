import { useState, Suspense, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Shield, UserPlus, KeyRound, Home, Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { checkAndRedirectToAuth } from "@/lib/authRedirect";
import { useTranslation } from "react-i18next";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

function AuthNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MoloChain
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/">
              <motion.span 
                className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
              >
                <Home className="h-4 w-4" />
                {t("auth.login.nav.home")}
              </motion.span>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="gap-2" data-testid="link-register-nav">
                <UserPlus className="h-4 w-4" />
                {t("auth.login.nav.register")}
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href="/">
                <span className="block text-gray-600 hover:text-blue-600 py-2">{t("auth.login.nav.home")}</span>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t("auth.login.nav.register")}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8 animate-pulse">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginContent() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    checkAndRedirectToAuth('/login');
  }, []);

  const getReturnUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl');
    
    if (!returnUrl) return null;
    
    try {
      const url = new URL(returnUrl);
      const trustedDomains = [
        'molochain.com',
        'www.molochain.com',
        'admin.molochain.com',
        'auth.molochain.com',
        'mololink.molochain.com',
        'app.molochain.com',
        'api.molochain.com',
        'opt.molochain.com'
      ];
      
      if (trustedDomains.includes(url.hostname)) {
        return returnUrl;
      }
    } catch {
      return null;
    }
    
    return null;
  };

  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginForm) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("auth.login.toast.success"),
        description: t("auth.login.toast.welcomeBack", { username: data.username })
      });
      
      const returnUrl = getReturnUrl();
      
      if (returnUrl) {
        window.location.href = returnUrl;
        return;
      }
      
      if (data.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
      
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: t("auth.login.toast.failed"),
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      toast({
        title: t("auth.login.toast.error"),
        description: t("auth.login.toast.fillFields"),
        variant: 'destructive'
      });
      return;
    }
    
    loginMutation.mutate(form);
  };

  return (
    <>
      <AuthNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <motion.div 
                className="flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t("auth.login.title")}
                </CardTitle>
                <CardDescription className="text-center text-gray-500 mt-2">
                  {t("auth.login.description")}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="email" className="text-gray-700 font-medium">{t("auth.login.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={loginMutation.isPending}
                    autoComplete="email"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    data-testid="input-email"
                  />
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-gray-700 font-medium">{t("auth.login.password")}</Label>
                    <Link href="/forgot-password">
                      <motion.span 
                        className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                        whileHover={{ scale: 1.02 }}
                        data-testid="link-forgot-password"
                      >
                        <KeyRound className="h-3 w-3" />
                        {t("auth.login.forgotPassword")}
                      </motion.span>
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={loginMutation.isPending}
                    autoComplete="current-password"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    data-testid="input-password"
                  />
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.65 }}
                >
                  <Checkbox
                    id="rememberMe"
                    checked={form.rememberMe}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, rememberMe: checked === true }))}
                    disabled={loginMutation.isPending}
                    data-testid="checkbox-remember-me"
                  />
                  <Label 
                    htmlFor="rememberMe" 
                    className="text-sm text-gray-600 cursor-pointer font-normal"
                  >
                    {t("auth.login.rememberMe")}
                  </Label>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300" 
                    disabled={loginMutation.isPending}
                    data-testid="button-signin"
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="h-5 w-5 mr-2" />
                    )}
                    {loginMutation.isPending ? t("auth.login.loggingIn") : t("auth.login.submit")}
                  </Button>
                </motion.div>

                <motion.div 
                  className="relative my-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">{t("auth.login.noAccount")}</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <Link href="/register">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium transition-all duration-300"
                      data-testid="button-register"
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      {t("auth.login.createAccount")}
                    </Button>
                  </Link>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>

          <motion.p 
            className="text-center text-sm text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {t("auth.login.agreementPrefix")}{" "}
            <Link href="/terms">
              <span className="text-blue-600 hover:underline cursor-pointer">{t("auth.login.termsOfService")}</span>
            </Link>{" "}
            {t("auth.login.and")}{" "}
            <Link href="/privacy">
              <span className="text-blue-600 hover:underline cursor-pointer">{t("auth.login.privacyPolicy")}</span>
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
