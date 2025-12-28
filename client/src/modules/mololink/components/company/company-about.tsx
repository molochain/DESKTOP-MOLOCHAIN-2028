import { MapPin, Globe, Calendar, Users, Building2, Hash, Award, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface CompanyAboutProps {
  company: Company;
}

export function CompanyAbout({ company }: CompanyAboutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {company.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        {company.description && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-molochain-primary" />
              Overview
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {company.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Company Details */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-molochain-primary" />
            Company Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.type && (
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground text-sm">Type:</div>
                <Badge variant="secondary">{company.type}</Badge>
              </div>
            )}
            {company.industry && (
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground text-sm">Industry:</div>
                <div className="text-sm font-medium">{company.industry}</div>
              </div>
            )}
            {company.size && (
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground text-sm">Company Size:</div>
                <div className="text-sm font-medium">{company.size} employees</div>
              </div>
            )}
            {company.founded && (
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground text-sm">Founded:</div>
                <div className="text-sm font-medium">{company.founded}</div>
              </div>
            )}
            {company.headquarters && (
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground text-sm">Headquarters:</div>
                <div className="text-sm font-medium">{company.headquarters}</div>
              </div>
            )}
            {company.website && (
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground text-sm">Website:</div>
                <a 
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                  data-testid="link-company-website-about"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Specialties */}
        {company.specialties && company.specialties.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-molochain-primary" />
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {company.specialties.map((specialty, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline"
                    className="px-3 py-1"
                    data-testid={`badge-specialty-${idx}`}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Locations */}
        {company.locations && company.locations.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-molochain-primary" />
                Office Locations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {company.locations.map((location, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    data-testid={`text-location-${idx}`}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{location}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Company Stats */}
        <Separator />
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-molochain-primary" />
            Company Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-molochain-primary">
                {company.employeeCount || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Employees</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-molochain-primary">
                {company.followerCount || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Followers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-molochain-primary">
                {company.locations?.length || 1}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Locations</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-molochain-primary">
                {company.founded ? new Date().getFullYear() - company.founded : 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Years Active</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}