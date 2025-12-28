import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import AdvancedSearch from "../components/advanced-search";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <Header />
      
      <div className="pt-20 pb-8">
        <AdvancedSearch />
      </div>
      
      <MobileNav />
    </div>
  );
}