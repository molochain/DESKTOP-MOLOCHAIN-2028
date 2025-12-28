import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Settings, FileText, Shield, Bell } from "lucide-react";
import { TwoFactorSection } from "@/components/auth";

export default function UserProfile() {
  const { user } = useAuth();

  // Mock data
  const mockUser = {
    id: "1",
    username: user?.username || "User",
    email: user?.email || "user@molochain.com",
    role: "User",
    joinDate: "January 15, 2025",
    lastLogin: "May 16, 2025",
    preferences: {
      notifications: true,
      twoFactorAuth: false,
      language: "English",
      theme: "Light"
    }
  };

  return (
    <div className="container max-w-5xl py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left side - Profile summary */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-primary/10">
                  {mockUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{mockUser.username}</h2>
              <p className="text-sm text-muted-foreground mb-2">{mockUser.email}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <User className="h-3 w-3 mr-1" />
                {mockUser.role}
              </p>
              
              <Separator className="my-4" />
              
              <div className="w-full text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{mockUser.joinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last login</span>
                  <span>{mockUser.lastLogin}</span>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Tabs and detailed content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Manage your account information and preferences
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
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="preferences">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Username</h3>
                      <p className="text-sm p-2 bg-muted rounded-md">{mockUser.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Email Address</h3>
                      <p className="text-sm p-2 bg-muted rounded-md">{mockUser.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Role</h3>
                      <p className="text-sm p-2 bg-muted rounded-md">{mockUser.role}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Account Status</h3>
                      <p className="text-sm p-2 bg-green-100 text-green-800 rounded-md">Active</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                      </div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                    
                    <TwoFactorSection />
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Login History</h3>
                        <p className="text-sm text-muted-foreground">View recent login attempts</p>
                      </div>
                      <Button variant="outline" size="sm">View History</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          {mockUser.preferences.notifications ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Language</h3>
                        <p className="text-sm text-muted-foreground">{mockUser.preferences.language}</p>
                      </div>
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Theme</h3>
                        <p className="text-sm text-muted-foreground">{mockUser.preferences.theme}</p>
                      </div>
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <div className="p-4 border rounded-md text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <h3 className="font-medium">No Documents Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't uploaded any documents yet
                    </p>
                    <Button>Upload Document</Button>
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