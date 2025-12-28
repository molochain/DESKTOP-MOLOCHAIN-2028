import { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { useLocation } from "wouter";
import { PageTransition } from "@/components/ui/page-transition";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  // Don't render Navigation for admin routes
  if (isAdminRoute) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PageTransition>
        <main className="flex-grow pt-16">
          {children}
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}