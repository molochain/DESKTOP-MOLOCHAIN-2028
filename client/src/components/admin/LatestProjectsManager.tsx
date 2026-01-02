import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProjectStatus = "active" | "completed" | "upcoming";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["active", "completed", "upcoming"]),
  route: z.string().min(1, "Route is required"),
  services: z.array(z.string()).min(1, "At least one service is required"),
  region: z.string().min(1, "Region is required"),
  cargo: z.object({
    type: z.string().min(1, "Cargo type is required"),
    weight: z.string().min(1, "Cargo weight is required"),
    containers: z.number().min(0, "Number of containers must be 0 or greater"),
  }),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface Project {
  id: string;
  title: string;
  description: string;
  route: string;
  services: string[];
  region: string;
  cargo: {
    type: string;
    weight: string;
    containers: number;
  };
  status: ProjectStatus;
  lastUpdate: string;
}

const services = [
  "Sea Freight",
  "Air Freight",
  "Road Transport",
  "Rail Transport",
  "Warehousing",
  "Custom Clearance"
];

const regions = [
  "Asia Pacific",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Middle East"
];

export default function LatestProjectsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
      route: "",
      services: [],
      region: "",
      cargo: {
        type: "",
        weight: "",
        containers: 0,
      },
    },
  });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/latest-projects"],
  });

  const createProject = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await fetch("/api/latest-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/latest-projects"] });
      toast({ title: "Success", description: "Project created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectFormData }) => {
      const response = await fetch(`/api/latest-projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/latest-projects"] });
      toast({ title: "Success", description: "Project updated successfully" });
      setIsDialogOpen(false);
      setSelectedProject(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/latest-projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/latest-projects"] });
      toast({ title: "Success", description: "Project deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (selectedProject) {
      updateProject.mutate({ id: selectedProject.id, data });
    } else {
      createProject.mutate(data);
    }
  };

  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Latest Projects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedProject(null);
              form.reset();
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                {selectedProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
              <DialogDescription>
                {selectedProject ? "Update project information" : "Create a new project entry"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="route"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Shanghai to Rotterdam" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {services.map((service) => (
                          <Button
                            key={service}
                            type="button"
                            variant={field.value.includes(service) ? "default" : "outline"}
                            onClick={() => {
                              const newValue = field.value.includes(service)
                                ? field.value.filter((s) => s !== service)
                                : [...field.value, service];
                              field.onChange(newValue);
                            }}
                          >
                            {service}
                          </Button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cargo.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo Type</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Electronics" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargo.weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo Weight</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 1000 kg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cargo.containers"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Number of Containers</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {selectedProject ? "Update" : "Create"} Project
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects?.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{project.title}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      form.reset({
                        title: project.title,
                        description: project.description,
                        status: project.status,
                        route: project.route,
                        services: project.services,
                        region: project.region,
                        cargo: project.cargo,
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // Use proper dialog for confirmation in production
                      const confirmed = true; // Replace with proper dialog
                      if (confirmed) {
                        deleteProject.mutate(project.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Route: {project.route}</Badge>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Region:</span> {project.region}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Services:</span>{" "}
                    {project.services.join(", ")}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Cargo:</span>{" "}
                    {project.cargo.type} ({project.cargo.weight},{" "}
                    {project.cargo.containers} containers)
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Last Update:</span>{" "}
                    {new Date(project.lastUpdate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}