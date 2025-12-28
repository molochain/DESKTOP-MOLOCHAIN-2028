import { Building2, MapPin, Globe, Calendar, Users, BadgeCheck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface CompanyHeaderProps {
  company: Company;
  isFollowing?: boolean;
  isAdmin?: boolean;
  onFollow: () => void;
  onEdit?: () => void;
}

export function CompanyHeader({ 
  company, 
  isFollowing, 
  isAdmin,
  onFollow,
  onEdit 
}: CompanyHeaderProps) {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden bg-gradient-to-r from-molochain-primary to-molochain-secondary">
        {company.coverImageUrl ? (
          <img
            src={company.coverImageUrl}
            alt={`${company.name} cover`}
            className="w-full h-full object-cover"
            data-testid={`img-company-cover-${company.id}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Stats Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-4 text-white">
          <div className="backdrop-blur-md bg-white/10 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{company.employeeCount || 0}</div>
            <div className="text-xs opacity-90">Employees</div>
          </div>
          <div className="backdrop-blur-md bg-white/10 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{company.followerCount || 0}</div>
            <div className="text-xs opacity-90">Followers</div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Logo */}
            <div className="relative">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-24 w-24 rounded-lg object-cover border-4 border-white dark:border-gray-900 shadow-xl"
                  data-testid={`img-company-logo-${company.id}`}
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-molochain-primary/10 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl">
                  <Building2 className="h-12 w-12 text-molochain-primary" />
                </div>
              )}
              {company.verified && (
                <BadgeCheck className="absolute -bottom-2 -right-2 h-8 w-8 text-blue-500 bg-white rounded-full" />
              )}
            </div>

            {/* Company Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2" data-testid={`text-company-name-${company.id}`}>
                    {company.name}
                    {company.verified && (
                      <BadgeCheck className="h-7 w-7 text-blue-500" />
                    )}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    {company.industry}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button
                      onClick={onEdit}
                      variant="outline"
                      data-testid="button-edit-company"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    onClick={onFollow}
                    variant={isFollowing ? "outline" : "default"}
                    data-testid="button-follow-company"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-4">
                {company.headquarters && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {company.headquarters}
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {company.size} employees
                  </div>
                )}
                {company.founded && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Founded {company.founded}
                  </div>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    data-testid="link-company-website"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>

              {/* Tags */}
              {company.type && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary">{company.type}</Badge>
                  {company.specialties?.slice(0, 3).map((specialty, idx) => (
                    <Badge key={idx} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}