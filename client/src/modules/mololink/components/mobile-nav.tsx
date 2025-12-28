import { Link } from "wouter";
import { Home, Users, Globe, Bell, Truck, Building2, Package, Search } from "lucide-react";

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        <Link href="/" className="flex flex-col items-center py-2 px-2 text-molochain-blue" data-testid="mobile-nav-home">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center py-2 px-2 text-gray-600" data-testid="mobile-nav-search">
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link href="/network" className="flex flex-col items-center py-2 px-2 text-gray-600" data-testid="mobile-nav-network">
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Network</span>
        </Link>
        <Link href="/companies" className="flex flex-col items-center py-2 px-2 text-gray-600" data-testid="mobile-nav-companies">
          <Building2 className="h-5 w-5" />
          <span className="text-xs mt-1">Companies</span>
        </Link>
        <Link href="/marketplace" className="flex flex-col items-center py-2 px-2 text-gray-600" data-testid="mobile-nav-marketplace">
          <Package className="h-5 w-5" />
          <span className="text-xs mt-1">Market</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center py-2 px-2 text-gray-600" data-testid="mobile-nav-notifications">
          <Bell className="h-5 w-5" />
          <span className="text-xs mt-1">Alerts</span>
        </Link>
        <Link href="/jobs" className="flex flex-col items-center py-2 px-2 text-gray-600" data-testid="mobile-nav-jobs">
          <Truck className="h-5 w-5" />
          <span className="text-xs mt-1">Jobs</span>
        </Link>
      </div>
    </nav>
  );
}
