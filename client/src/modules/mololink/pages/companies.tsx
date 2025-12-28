import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Building2,
  Users,
  MapPin,
  BadgeCheck,
  Search,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import Header from "../components/header";
import MobileNav from "../components/mobile-nav";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companies, isLoading, error } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const filteredCompanies = companies?.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.specialties?.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-molochain-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Failed to load companies</h3>
              <p className="text-muted-foreground">
                Please try refreshing the page or check your connection.
              </p>
            </CardContent>
          </Card>
        </div>
        <MobileNav />
        <div className="md:hidden h-20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-molochain-bg">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Companies</h1>
            <p className="text-muted-foreground mt-2">
              Discover and connect with logistics & supply chain companies
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            aria-label="Add your company to the directory"
            data-testid="button-add-company"
          >
            <Plus className="h-4 w-4" />
            Add Your Company
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search companies by name, industry, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-company-search"
            aria-label="Search companies"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCompanies && filteredCompanies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/company/${company.slug}`}
              data-testid={`link-company-${company.id}`}
              aria-label={`View ${company.name} company profile`}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-12 w-12 rounded-lg object-cover"
                          data-testid={`img-company-logo-${company.id}`}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      {company.verified && (
                        <BadgeCheck className="h-5 w-5 text-blue-500" aria-label="Verified company" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2" data-testid={`text-company-name-${company.id}`}>
                    {company.name}
                  </h3>

                  {company.industry && (
                    <Badge variant="secondary" className="mb-3">
                      {company.industry}
                    </Badge>
                  )}

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {company.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {company.headquarters && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{company.headquarters}</span>
                      </div>
                    )}
                    {company.employeeCount !== undefined && company.employeeCount !== null && company.employeeCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{company.employeeCount} employees</span>
                      </div>
                    )}
                  </div>

                  {company.specialties && company.specialties.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {company.specialties.slice(0, 3).map((specialty, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {company.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{company.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Be the first to add your company"}
            </p>
          </CardContent>
        </Card>
      )}
      </div>
      <MobileNav />
      <div className="md:hidden h-20"></div> {/* Spacer for mobile nav */}
    </div>
  );
}