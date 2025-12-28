import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

// Use the Office interface defined in the parent component
interface Office {
  id: string;
  name: string;
  country: string;
  address: string;
  phone: string;
  fax?: string;
  email: string;
  coordinates: number[];
  type: string;
  services: string[];
  image: string;
  timezone: string;
  operatingHours: string;
}

interface OfficeSearchProps {
  offices: Office[];
  onFilter: (filteredOffices: Office[]) => void;
}

const OfficeSearch = ({ offices, onFilter }: OfficeSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  // Extract unique countries, types, and services from offices
  const countries = Array.from(new Set(offices.map(office => office.country))).sort();
  const types = Array.from(new Set(offices.map(office => office.type))).sort();
  
  // Flatten services arrays and get unique values
  const services = Array.from(new Set(offices.flatMap(office => office.services))).sort();
  
  const handleSearch = () => {
    const filtered = offices.filter(office => {
      // Check search term
      const matchesSearch = 
        searchTerm === "" ||
        office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.country.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check country filter
      const matchesCountry = 
        selectedCountry === null || 
        office.country === selectedCountry;
      
      // Check type filter
      const matchesType = 
        selectedType === null || 
        office.type === selectedType;
      
      // Check service filter
      const matchesService = 
        selectedService === null || 
        office.services.includes(selectedService);
      
      return matchesSearch && matchesCountry && matchesType && matchesService;
    });
    
    onFilter(filtered);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry(null);
    setSelectedType(null);
    setSelectedService(null);
    onFilter(offices); // Reset to show all offices
  };
  
  // Create a readable label for office type
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'headquarter': return 'Headquarters';
      case 'regional': return 'Regional Office';
      case 'port': return 'Port Office';
      default: return type;
    }
  };
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search-offices">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-offices"
              placeholder="Search by name or country..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-40">
            <Label htmlFor="country-filter">Country</Label>
            <select
              id="country-filter"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={selectedCountry || ""}
              onChange={(e) => setSelectedCountry(e.target.value || null)}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-40">
            <Label htmlFor="type-filter">Office Type</Label>
            <select
              id="type-filter"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={selectedType || ""}
              onChange={(e) => setSelectedType(e.target.value || null)}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-40">
            <Label htmlFor="service-filter">Service</Label>
            <select
              id="service-filter"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={selectedService || ""}
              onChange={(e) => setSelectedService(e.target.value || null)}
            >
              <option value="">All Services</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {selectedCountry && (
            <Badge variant="outline" className="flex items-center gap-1">
              Country: {selectedCountry}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCountry(null)} />
            </Badge>
          )}
          {selectedType && (
            <Badge variant="outline" className="flex items-center gap-1">
              Type: {getTypeLabel(selectedType)}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType(null)} />
            </Badge>
          )}
          {selectedService && (
            <Badge variant="outline" className="flex items-center gap-1">
              Service: {selectedService}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedService(null)} />
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: {searchTerm}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="h-8"
          >
            Clear
          </Button>
          <Button 
            onClick={handleSearch}
            size="sm"
            className="h-8"
          >
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfficeSearch;