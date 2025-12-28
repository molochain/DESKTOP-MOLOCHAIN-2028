import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  User, 
  LogOut, 
  Settings, 
  UserPlus, 
  ChevronDown,
  Package,
  Globe,
  Truck,
  Info,
  Home,
  Phone,
  Users,
  Network,
  MessageSquare,
  Shield,
  FileSearch
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/session/LanguageSwitcher";
import { WebSocketHeaderIndicator } from "@/components/common/status/WebSocketStatusIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useCMSMenu } from "@/hooks/use-cms";
import { cn } from "@/lib/utils";

const NavDropdown = ({ 
  trigger, 
  items, 
  isActive 
}: { 
  trigger: string; 
  items: { href: string; label: string; icon?: React.ReactNode; description?: string }[];
  isActive: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [location, navigate] = useLocation();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            "hover:bg-accent/50",
            isActive && "bg-primary/10 text-primary",
            !isActive && "text-foreground/80 hover:text-foreground"
          )}
        >
          {trigger}
          <ChevronDown className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-2">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.href}
            onClick={() => {
              if (item.href.startsWith('http://') || item.href.startsWith('https://')) {
                window.open(item.href, '_blank', 'noopener,noreferrer');
              } else {
                navigate(item.href);
              }
              setOpen(false);
            }}
            className="flex items-start gap-3 p-3 cursor-pointer rounded-md hover:bg-accent"
          >
            {item.icon && (
              <div className="mt-0.5 text-muted-foreground">
                {item.icon}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="font-medium">{item.label}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AuthButton = () => {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserPlus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('auth.actions.title', 'Authentication')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = '/login'}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('auth.actions.login', 'Login')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = '/register'}>
          <UserPlus className="mr-2 h-4 w-4" />
          <span>{t('auth.actions.register', 'Register')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ProfileMenu = ({ user, onLogout }: { user: any; onLogout: () => Promise<void> }) => {
  const { t } = useTranslation();
  const [_, navigate] = useLocation();
  
  const isAdmin = user?.role === 'admin';
  const isDeveloper = user?.role === 'developer';
  const profileUrl = isAdmin ? '/admin/profile' : '/profile';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate('/dashboard')}
          className="font-medium"
        >
          <Home className="mr-2 h-4 w-4" />
          <span>{t('profile.menu.dashboard', 'Dashboard')}</span>
        </DropdownMenuItem>
        {(isAdmin || isDeveloper) && (
          <>
            <DropdownMenuItem 
              onClick={() => navigate('/admin/master')}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 font-medium"
            >
              <Settings className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">Control Center</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(profileUrl)}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('profile.menu.profile', 'Profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('profile.menu.settings', 'Settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('profile.menu.logout', 'Log out')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navigation = () => {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();
  const { data: cmsMenu } = useCMSMenu();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
    }
  };

  const navigationGroups = {
    dashboard: user ? {
      trigger: "Dashboard",
      items: [
        { 
          href: "/dashboard", 
          label: "My Dashboard",
          icon: <Home className="h-4 w-4" />,
          description: "Access your personalized dashboard"
        },
        { 
          href: "/profile", 
          label: "Profile",
          icon: <User className="h-4 w-4" />,
          description: "Manage your account settings"
        },
        { 
          href: "/settings", 
          label: "Settings",
          icon: <Settings className="h-4 w-4" />,
          description: "Configure your preferences"
        }
      ]
    } : null,
    services: {
      trigger: "Services",
      items: [
        { 
          href: "/services", 
          label: "All Services",
          icon: <Package className="h-4 w-4" />,
          description: "View our complete service catalog"
        },
        { 
          href: "/tracking", 
          label: "Track Shipment",
          icon: <Truck className="h-4 w-4" />,
          description: "Real-time shipment tracking"
        },
        { 
          href: "/quote", 
          label: "Get Quote",
          icon: <MessageSquare className="h-4 w-4" />,
          description: "Request a custom quote"
        }
      ]
    },
    solutions: {
      trigger: "Solutions",
      items: [
        { 
          href: "https://mololink.molochain.com", 
          label: "MOLOLINK",
          icon: <Network className="h-4 w-4" />,
          description: "Professional logistics network"
        },
        { 
          href: "/ecosystem", 
          label: "Ecosystem",
          icon: <Globe className="h-4 w-4" />,
          description: "Integrated platform ecosystem"
        },
        { 
          href: "/partners", 
          label: "Partners",
          icon: <Users className="h-4 w-4" />,
          description: "Our trusted partners"
        },
      ]
    },
    resources: {
      trigger: "Resources",
      items: [
        { 
          href: "/terms", 
          label: "Terms of Service",
          icon: <FileSearch className="h-4 w-4" />,
          description: "Legal terms and policies"
        },
        { 
          href: "/privacy", 
          label: "Privacy Policy",
          icon: <Shield className="h-4 w-4" />,
          description: "Data protection and privacy"
        },
        { 
          href: "/contact", 
          label: "Contact Us",
          icon: <Phone className="h-4 w-4" />,
          description: "Get in touch with our team"
        }
      ]
    },
    company: {
      trigger: "Company",
      items: [
        { 
          href: "/about", 
          label: "About Us",
          icon: <Info className="h-4 w-4" />,
          description: "Learn about MoloChain"
        },
        { 
          href: "/partners", 
          label: "Partners",
          icon: <Users className="h-4 w-4" />,
          description: "Our trusted partners"
        },
        { 
          href: "/contact", 
          label: "Contact",
          icon: <Phone className="h-4 w-4" />,
          description: "Get in touch with us"
        }
      ]
    }
  };

  const isDropdownActive = (items: { href: string }[]) => {
    return items.some(item => location === item.href);
  };

  const cmsToNavGroupMap: Record<string, string> = {
    'home': 'home',
    'services': 'services',
    'ecosystem': 'solutions',
    'contact': 'contact',
  };

  const renderMainNav = () => {
    if (!cmsMenu || cmsMenu.length === 0) {
      return (
        <>
          <button
            onClick={() => navigate("/")}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              "hover:bg-accent/50",
              location === "/" && "bg-primary/10 text-primary",
              location !== "/" && "text-foreground/80 hover:text-foreground"
            )}
          >
            Home
          </button>

          {user && navigationGroups.dashboard && (
            <NavDropdown
              key="dashboard"
              trigger={navigationGroups.dashboard.trigger}
              items={navigationGroups.dashboard.items}
              isActive={isDropdownActive(navigationGroups.dashboard.items)}
            />
          )}

          <NavDropdown
            key="services"
            trigger={navigationGroups.services.trigger}
            items={navigationGroups.services.items}
            isActive={isDropdownActive(navigationGroups.services.items)}
          />

          <NavDropdown
            key="solutions"
            trigger={navigationGroups.solutions.trigger}
            items={navigationGroups.solutions.items}
            isActive={isDropdownActive(navigationGroups.solutions.items)}
          />

          <NavDropdown
            key="resources"
            trigger={navigationGroups.resources.trigger}
            items={navigationGroups.resources.items}
            isActive={isDropdownActive(navigationGroups.resources.items)}
          />

          <NavDropdown
            key="company"
            trigger={navigationGroups.company.trigger}
            items={navigationGroups.company.items}
            isActive={isDropdownActive(navigationGroups.company.items)}
          />
        </>
      );
    }

    const navElements: React.ReactNode[] = [];

    cmsMenu.forEach((menuItem) => {
      const menuLabel = menuItem.label.toLowerCase();

      if (menuLabel === 'home') {
        navElements.push(
          <button
            key="home"
            onClick={() => navigate("/")}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              "hover:bg-accent/50",
              location === "/" && "bg-primary/10 text-primary",
              location !== "/" && "text-foreground/80 hover:text-foreground"
            )}
          >
            {menuItem.label}
          </button>
        );
      }
      else if (menuLabel === 'services' && navigationGroups.services) {
        navElements.push(
          <NavDropdown
            key="services"
            trigger={menuItem.label}
            items={navigationGroups.services.items}
            isActive={isDropdownActive(navigationGroups.services.items)}
          />
        );
      }
      else if (menuLabel === 'ecosystem' && navigationGroups.solutions) {
        navElements.push(
          <NavDropdown
            key="solutions"
            trigger={menuItem.label}
            items={navigationGroups.solutions.items}
            isActive={isDropdownActive(navigationGroups.solutions.items)}
          />
        );
      }
      else if (menuLabel === 'contact') {
        navElements.push(
          <button
            key="contact"
            onClick={() => navigate("/contact")}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              "hover:bg-accent/50",
              location === "/contact" && "bg-primary/10 text-primary",
              location !== "/contact" && "text-foreground/80 hover:text-foreground"
            )}
          >
            {menuItem.label}
          </button>
        );
      }
    });

    const cmsLabels = cmsMenu.map(m => m.label.toLowerCase());
    
    if (user && navigationGroups.dashboard) {
      navElements.push(
        <NavDropdown
          key="dashboard"
          trigger={navigationGroups.dashboard.trigger}
          items={navigationGroups.dashboard.items}
          isActive={isDropdownActive(navigationGroups.dashboard.items)}
        />
      );
    }

    navElements.push(
      <NavDropdown
        key="resources"
        trigger={navigationGroups.resources.trigger}
        items={navigationGroups.resources.items}
        isActive={isDropdownActive(navigationGroups.resources.items)}
      />
    );

    navElements.push(
      <NavDropdown
        key="company"
        trigger={navigationGroups.company.trigger}
        items={navigationGroups.company.items}
        isActive={isDropdownActive(navigationGroups.company.items)}
      />
    );

    return navElements;
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled 
        ? "bg-background/95 backdrop-blur-lg shadow-sm border-b" 
        : "bg-transparent backdrop-blur-sm border-b border-border/10"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center gap-2 group">
                <img 
                  src="/molochain-logo.png"
                  alt="MOLOCHAIN" 
                  className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {renderMainNav()}
          </div>

          <div className="flex items-center gap-3">
            <WebSocketHeaderIndicator />
            
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {user ? <ProfileMenu user={user} onLogout={handleLogout} /> : <AuthButton />}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col p-0">
                <div className="flex items-center gap-2 p-6 pb-4 flex-shrink-0 border-b">
                  <img 
                    src="/molochain-logo.png"
                    alt="MOLOCHAIN" 
                    className="h-8 w-auto"
                  />
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-1 p-4">
                    <button
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all",
                        location === "/" 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => {
                        navigate("/");
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Home className="h-4 w-4" />
                        Home
                      </div>
                    </button>

                    {Object.entries(navigationGroups).filter(([key, group]) => group !== null).map(([key, group]) => (
                      <div key={key} className="space-y-1">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group!.trigger}
                        </div>
                        {group!.items.map((item) => (
                          <button
                            key={item.href}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg text-sm transition-all",
                              location === item.href 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-accent"
                            )}
                            onClick={() => {
                              navigate(item.href);
                              setOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              <div className="flex-1">
                                <div className="font-medium">{item.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 pb-6 px-6 flex-shrink-0">
                  <LanguageSwitcher />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
