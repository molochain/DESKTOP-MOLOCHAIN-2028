import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Search, 
  Home, 
  Users, 
  Briefcase, 
  MessageCircle, 
  Bell, 
  Building2, 
  ShoppingBag,
  Network,
  Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/auth";
import { WebSocketIndicator } from "../components/websocket-indicator";
import { NotificationCenter } from "../components/notification-center";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if we're on a mololink page
  const isMololinkPage = location.startsWith("/mololink");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/mololink/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    } else {
      setLocation("/mololink/search");
    }
  };

  const handleSearchClick = () => {
    setLocation("/mololink/search");
  };

  if (!isMololinkPage) return null;

  return (
    <header className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-b border-blue-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main MOLOLINK Navigation Bar */}
        <div className="flex justify-between items-center h-14">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/mololink/home" className="flex items-center group">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
                <Network className="h-5 w-5 text-white" />
              </div>
              <div className="ml-2">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MOLOLINK
                </span>
                <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0">
                  Professional Network
                </Badge>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          {user && (
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="text"
                  placeholder="Search professionals, companies, opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-9 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  onClick={handleSearchClick}
                  data-testid="input-mololink-search"
                />
                <Search 
                  className="absolute left-3 top-2 h-5 w-5 text-gray-400 cursor-pointer" 
                  onClick={handleSearchClick}
                />
              </form>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/mololink/home">
              <Button 
                variant={location === "/mololink/home" ? "default" : "ghost"}
                size="sm"
                className={location === "/mololink/home" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "hover:bg-blue-100"
                }
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <Link href="/mololink/network">
              <Button 
                variant={location === "/mololink/network" ? "default" : "ghost"}
                size="sm"
                className={location === "/mololink/network" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "hover:bg-blue-100"
                }
              >
                <Users className="h-4 w-4 mr-2" />
                Network
              </Button>
            </Link>

            <Link href="/mololink/jobs">
              <Button 
                variant={location === "/mololink/jobs" ? "default" : "ghost"}
                size="sm"
                className={location === "/mololink/jobs" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "hover:bg-blue-100"
                }
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs
              </Button>
            </Link>

            <Link href="/mololink/companies">
              <Button 
                variant={location === "/mololink/companies" ? "default" : "ghost"}
                size="sm"
                className={location === "/mololink/companies" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "hover:bg-blue-100"
                }
              >
                <Building2 className="h-4 w-4 mr-2" />
                Companies
              </Button>
            </Link>

            <Link href="/mololink/marketplace">
              <Button 
                variant={location === "/mololink/marketplace" ? "default" : "ghost"}
                size="sm"
                className={location === "/mololink/marketplace" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "hover:bg-blue-100"
                }
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Marketplace
              </Button>
            </Link>

            {user && (
              <>
                <Link href="/mololink/messaging">
                  <Button 
                    variant={location === "/mololink/messaging" ? "default" : "ghost"}
                    size="sm"
                    className={location === "/mololink/messaging" 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      : "hover:bg-blue-100"
                    }
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>

                {/* Real-time indicators */}
                <div className="flex items-center space-x-2 ml-2">
                  <WebSocketIndicator size="sm" showLabel={false} />
                  <NotificationCenter />
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchClick}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <NotificationCenter />
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-blue-100 py-2">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <Link href="/mololink/home">
              <Button 
                variant={location === "/mololink/home" ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/mololink/network">
              <Button 
                variant={location === "/mololink/network" ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0"
              >
                <Users className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/mololink/jobs">
              <Button 
                variant={location === "/mololink/jobs" ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0"
              >
                <Briefcase className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/mololink/companies">
              <Button 
                variant={location === "/mololink/companies" ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0"
              >
                <Building2 className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/mololink/marketplace">
              <Button 
                variant={location === "/mololink/marketplace" ? "default" : "ghost"}
                size="sm"
                className="flex-shrink-0"
              >
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </Link>

            {user && (
              <Link href="/mololink/messaging">
                <Button 
                  variant={location === "/mololink/messaging" ? "default" : "ghost"}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}