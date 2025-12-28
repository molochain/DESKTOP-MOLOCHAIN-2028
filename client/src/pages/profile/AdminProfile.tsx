import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  FileText, 
  Shield, 
  Users, 
  Activity, 
  Key 
} from "lucide-react";

export default function AdminProfile() {
  const { user } = useAuth();

  // Mock data
  const mockAdmin = {
    id: "1",
    username: user?.username || "Administrator",
    email: user?.email || "admin@molochain.com",
    role: "Admin",
    joinDate: "October 10, 2024",
    lastLogin: "May 16, 2025",
    permissions: ["user_management", "content_management", "system_settings", "api_access"],
    accessLevel: "Super Admin",
    recentActivity: [
      { action: "User created", timestamp: "2025-05-15 14:23", target: "john.doe@molochain.com" },
      { action: "Settings updated", timestamp: "2025-05-14 09:45", target: "Email Notifications" },
      { action: "Document approved", timestamp: "2025-05-12 16:30", target: "Shipping Manifest #3452" }
    ]
  };

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <Badge className="bg-amber-600">Admin Panel</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left side - Profile summary */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-amber-100 text-amber-800">
                  {mockAdmin.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{mockAdmin.username}</h2>
              <p className="text-sm text-muted-foreground mb-2">{mockAdmin.email}</p>
              <Badge variant="secondary" className="mb-2">
                {mockAdmin.accessLevel}
              </Badge>
              
              <Separator className="my-4" />
              
              <div className="w-full text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Admin since</span>
                  <span>{mockAdmin.joinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last login</span>
                  <span>{mockAdmin.lastLogin}</span>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Access & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {mockAdmin.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center">
                    <Shield className="h-3.5 w-3.5 mr-2 text-green-600" />
                    <span>{permission.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Tabs and detailed content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Administrator Account</CardTitle>
              <CardDescription>
                Manage your administrator profile and system access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile">
                <TabsList className="mb-4">
                  <TabsTrigger value="profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    <Key className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <Activity className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="system">
                    <Settings className="h-4 w-4 mr-2" />
                    System
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Username</h3>
                      <p className="text-sm p-2 bg-muted rounded-md">{mockAdmin.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Email Address</h3>
                      <p className="text-sm p-2 bg-muted rounded-md">{mockAdmin.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Role</h3>
                      <p className="text-sm p-2 bg-muted rounded-md">{mockAdmin.role}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Access Level</h3>
                      <p className="text-sm p-2 bg-amber-100 text-amber-800 rounded-md">{mockAdmin.accessLevel}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Admin Quick Links</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <Button variant="outline" size="sm" className="justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        User Management
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Content Manager
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Activity className="h-4 w-4 mr-2" />
                        System Logs
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Shield className="h-4 w-4 mr-2" />
                        Permissions
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        System Settings
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Admin Password</h3>
                        <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                      </div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                          Enabled
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">API Access Keys</h3>
                        <p className="text-sm text-muted-foreground">2 active keys</p>
                      </div>
                      <Button variant="outline" size="sm">Manage Keys</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Session Timeout</h3>
                        <p className="text-sm text-muted-foreground">30 minutes</p>
                      </div>
                      <Button variant="outline" size="sm">Modify</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                    
                    {mockAdmin.recentActivity.map((item, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-md">
                        <div>
                          <h4 className="text-sm font-medium">{item.action}</h4>
                          <p className="text-xs text-muted-foreground">Target: {item.target}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                      </div>
                    ))}
                    
                    <div className="pt-2 flex justify-end">
                      <Button variant="link" size="sm" className="text-sm">
                        View Full Activity Log
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="system" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">System Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive critical system alerts
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Admin Interface Settings</h3>
                        <p className="text-sm text-muted-foreground">Customize admin experience</p>
                      </div>
                      <Button variant="outline" size="sm">Customize</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Database Maintenance</h3>
                        <p className="text-sm text-muted-foreground">Schedule and monitor maintenance</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md bg-amber-50">
                      <div>
                        <h3 className="font-medium text-amber-800">Emergency Controls</h3>
                        <p className="text-sm text-amber-700">Critical system operations</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-amber-600 text-amber-700 hover:bg-amber-100">
                        Access
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}