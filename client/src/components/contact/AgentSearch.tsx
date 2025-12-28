import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
// Agent Status interface
interface AgentStatus {
  id: string;
  name: string;
  email: string;
  country: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  connectionQuality?: string;
  networkAvailability?: string;
  responseTime?: string;
  lastUpdated?: string;
  region?: string;
  specialty?: string[];
  lastActive: string;
  phone?: string;
  timezone?: string;
  languages?: string[];
  profileImage?: string;
  experience?: number;
  rating?: number;
  projects?: number;
  customFields?: Record<string, any>;
}
import AgentStatusFilter from './AgentStatusFilter';

// Use the Agent interface defined in the parent component
interface Agent {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  languages: string[];
  specialty: string[];
  photo?: string;
}

// Use the RegionalAgent interface defined in the parent component
interface RegionalAgent {
  country: string;
  flag: string;
  agents: Agent[];
}

interface AgentSearchProps {
  regionalAgents: RegionalAgent[];
  onFilter: (filteredAgents: RegionalAgent[]) => void;
  agentStatuses?: AgentStatus[];
}

const AgentSearch = ({ regionalAgents, onFilter, agentStatuses = [] }: AgentSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  
  // Extract unique countries and roles
  const countries = regionalAgents.map(region => region.country).sort();
  
  // Extract all unique agent roles
  const roles = Array.from(new Set(
    regionalAgents.flatMap(region => 
      region.agents.map(agent => agent.role)
    )
  )).sort();
  
  const handleSearch = () => {
    // First, filter by country if selected
    let filteredResults = [...regionalAgents];
    
    if (selectedCountry) {
      filteredResults = filteredResults.filter(region => 
        region.country === selectedCountry
      );
    }
    
    // Then, for each remaining country, filter agents by role, status, and search term
    filteredResults = filteredResults.map(region => {
      let filteredAgents = [...region.agents];
      
      // Filter by role if selected
      if (selectedRole) {
        filteredAgents = filteredAgents.filter(agent => 
          agent.role === selectedRole
        );
      }
      
      // Filter by agent status if selected and if we have status data
      if (selectedStatus !== 'all' && agentStatuses.length > 0) {
        filteredAgents = filteredAgents.filter(agent => {
          const agentStatus = agentStatuses.find(status => status.id === agent.id);
          return agentStatus && agentStatus.status === selectedStatus;
        });
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredAgents = filteredAgents.filter(agent => 
          agent.name.toLowerCase().includes(term) || 
          agent.email.toLowerCase().includes(term) ||
          agent.role.toLowerCase().includes(term) ||
          agent.phone.toLowerCase().includes(term)
        );
      }
      
      // Return the region with filtered agents
      return {
        ...region,
        agents: filteredAgents
      };
    });
    
    // Remove any regions that have no agents left after filtering
    filteredResults = filteredResults.filter(region => region.agents.length > 0);
    
    onFilter(filteredResults);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry(null);
    setSelectedRole(null);
    setSelectedStatus('all');
    onFilter(regionalAgents); // Reset to show all agents
  };
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search-agents">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-agents"
              placeholder="Search by name, role or contact details..."
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
            <Label htmlFor="role-filter">Role</Label>
            <select
              id="role-filter"
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={selectedRole || ""}
              onChange={(e) => setSelectedRole(e.target.value || null)}
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Status filter if we have agent statuses */}
      {agentStatuses.length > 0 && (
        <AgentStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          agentStatuses={agentStatuses}
        />
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {selectedCountry && (
            <Badge variant="outline" className="flex items-center gap-1">
              Country: {selectedCountry}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCountry(null)} />
            </Badge>
          )}
          {selectedRole && (
            <Badge variant="outline" className="flex items-center gap-1">
              Role: {selectedRole}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedRole(null)} />
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: {searchTerm}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {selectedStatus}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatus('all')} />
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

export default AgentSearch;