import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../lib/auth";
import { Plus, Award, X, Users, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "../lib/queryClient";
import type { User, Post, Comment, Connection, Company, CompanyEmployee, CompanyPost, Skill, MarketplaceListing, MarketplaceAuction, MarketplaceBid, MarketplaceServicePost } from "../lib/schema";

interface SkillWithEndorsers extends Skill {
  endorsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  }>;
}

interface SkillsSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

const skillCategories = [
  "Logistics",
  "Technology", 
  "Operations",
  "Management",
  "Compliance",
  "Maritime",
  "Procurement",
  "Process Improvement",
  "Business",
  "Other"
];

export default function SkillsSection({ userId, isOwnProfile }: SkillsSectionProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [showEndorsers, setShowEndorsers] = useState<string | null>(null);

  const { data: skills = [], isLoading } = useQuery<SkillWithEndorsers[]>({
    queryKey: [`/api/users/${userId}/skills`],
  });

  const addSkillMutation = useMutation({
    mutationFn: async (skillData: { skillName: string; category: string }) => {
      const res = await apiRequest('POST', '/api/skills', { userId, ...skillData });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      setShowAddSkill(false);
      setNewSkillName("");
      setNewSkillCategory("");
      toast({
        title: "Skill added",
        description: "Your new skill has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const res = await apiRequest('DELETE', `/api/skills/${skillId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      toast({
        title: "Skill removed",
        description: "The skill has been removed from your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove skill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const endorseMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const res = await apiRequest('POST', `/api/skills/${skillId}/endorse`, { endorserId: currentUser?.id });
      return res.json();
    },
    onSuccess: (data: any, skillId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      const skill = skills.find(s => s.id === skillId);
      toast({
        title: data.endorsed ? "Skill endorsed" : "Endorsement removed",
        description: data.endorsed 
          ? `You endorsed ${skill?.skillName}` 
          : `You removed your endorsement for ${skill?.skillName}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update endorsement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill name.",
        variant: "destructive",
      });
      return;
    }
    addSkillMutation.mutate({ 
      skillName: newSkillName.trim(), 
      category: newSkillCategory || "Other" 
    });
  };

  const toggleSkillExpansion = (skillId: string) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skillId)) {
      newExpanded.delete(skillId);
    } else {
      newExpanded.add(skillId);
    }
    setExpandedSkills(newExpanded);
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, SkillWithEndorsers[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Endorsements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading skills...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Endorsements
          </CardTitle>
          {isOwnProfile && (
            <Dialog open={showAddSkill} onOpenChange={setShowAddSkill}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" data-testid="button-add-skill">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Skill</DialogTitle>
                  <DialogDescription>
                    Add a skill to showcase your expertise in logistics and supply chain.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Skill Name</label>
                    <Input
                      placeholder="e.g., Supply Chain Management"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      data-testid="input-skill-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                      <SelectTrigger data-testid="select-skill-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddSkill(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddSkill}
                    disabled={addSkillMutation.isPending}
                    data-testid="button-save-skill"
                  >
                    {addSkillMutation.isPending ? "Adding..." : "Add Skill"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>{isOwnProfile ? "You haven't added any skills yet" : "No skills to display"}</p>
            {isOwnProfile && (
              <p className="text-sm mt-2">Add skills to showcase your expertise</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
                <div className="space-y-3">
                  {categorySkills
                    .sort((a, b) => (b.endorsementCount || 0) - (a.endorsementCount || 0))
                    .map((skill) => {
                      const isExpanded = expandedSkills.has(skill.id);
                      const hasEndorsed = skill.endorsers.some(e => e.id === currentUser?.id);
                      
                      return (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium">{skill.skillName}</h4>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {skill.endorsementCount || 0}
                                </Badge>
                              </div>
                              
                              {skill.endorsers.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                      {skill.endorsers.slice(0, 3).map((endorser) => (
                                        <Avatar key={endorser.id} className="h-6 w-6 border-2 border-background">
                                          <AvatarImage src={endorser.profileImage || undefined} />
                                          <AvatarFallback className="text-xs">
                                            {endorser.firstName[0]}{endorser.lastName[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                    </div>
                                    {skill.endorsers.length > 3 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-auto p-0"
                                        onClick={() => toggleSkillExpansion(skill.id)}
                                        data-testid={`button-show-endorsers-${skill.id}`}
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3 w-3 mr-1" />
                                            Show less
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3 w-3 mr-1" />
                                            +{skill.endorsers.length - 3} more
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {isExpanded && (
                                    <div className="mt-3 space-y-2">
                                      {skill.endorsers.map((endorser) => (
                                        <div key={endorser.id} className="flex items-center gap-2 text-sm">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={endorser.profileImage || undefined} />
                                            <AvatarFallback className="text-xs">
                                              {endorser.firstName[0]}{endorser.lastName[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>{endorser.firstName} {endorser.lastName}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!isOwnProfile && currentUser && (
                                <Button
                                  size="sm"
                                  variant={hasEndorsed ? "default" : "outline"}
                                  onClick={() => endorseMutation.mutate(skill.id)}
                                  disabled={endorseMutation.isPending}
                                  data-testid={`button-endorse-${skill.id}`}
                                >
                                  {hasEndorsed ? "Endorsed" : "Endorse"}
                                </Button>
                              )}
                              {isOwnProfile && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteSkillMutation.mutate(skill.id)}
                                  disabled={deleteSkillMutation.isPending}
                                  data-testid={`button-delete-skill-${skill.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}