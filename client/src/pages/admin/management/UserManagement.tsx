import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Search, UserPlus, Shield, Users, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator' | 'manager' | 'analyst';
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
}

interface UpdateUserForm {
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

const roleColors = {
  admin: 'bg-red-500 text-white',
  moderator: 'bg-orange-500 text-white',
  manager: 'bg-blue-500 text-white',
  analyst: 'bg-purple-500 text-white',
  user: 'bg-gray-500 text-white'
};

const availablePermissions = [
  'read', 'write', 'admin', 'manage_users', 'manage_system', 
  'view_analytics', 'manage_content', 'manage_settings'
];

export default function UserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    username: '',
    email: '',
    password: '',
    role: 'user',
    permissions: ['read']
  });
  const [updateForm, setUpdateForm] = useState<UpdateUserForm>({
    username: '',
    email: '',
    role: 'user',
    permissions: ['read'],
    isActive: true
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/admin/users/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users/stats');
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return response.json();
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats'] });
      setIsCreateDialogOpen(false);
      setCreateForm({
        username: '',
        email: '',
        password: '',
        role: 'user',
        permissions: ['read']
      });
      toast({
        title: t('admin.management.users.toast.success'),
        description: t('admin.management.users.toast.userCreated')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('admin.management.users.toast.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: UpdateUserForm }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: t('admin.management.users.toast.success'),
        description: t('admin.management.users.toast.userUpdated')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('admin.management.users.toast.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats'] });
      toast({
        title: t('admin.management.users.toast.success'),
        description: t('admin.management.users.toast.userDeleted')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('admin.management.users.toast.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleCreateUser = () => {
    createUserMutation.mutate(createForm);
  };

  const handleUpdateUser = () => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, userData: updateForm });
    }
  };

  const handleDeleteUser = (id: number) => {
    const confirmed = window.confirm(t('admin.management.users.dialog.deleteConfirm'));
    if (confirmed) {
      deleteUserMutation.mutate(id);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setUpdateForm({
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions || ['read'],
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handlePermissionToggle = (permission: string, isCreate = false) => {
    if (isCreate) {
      setCreateForm(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else {
      setUpdateForm(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.management.users.title')}</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('admin.management.users.buttons.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{t('admin.management.users.dialog.createTitle')}</DialogTitle>
              <DialogDescription>
                {t('admin.management.users.dialog.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">{t('admin.management.users.form.username')}</Label>
                <Input
                  id="username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder={t('admin.management.users.form.usernamePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="email">{t('admin.management.users.form.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('admin.management.users.form.emailPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="password">{t('admin.management.users.form.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t('admin.management.users.form.passwordPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="role">{t('admin.management.users.form.role')}</Label>
                <Select value={createForm.role} onValueChange={(value) => setCreateForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{t('admin.management.users.roles.user')}</SelectItem>
                    <SelectItem value="analyst">{t('admin.management.users.roles.analyst')}</SelectItem>
                    <SelectItem value="manager">{t('admin.management.users.roles.manager')}</SelectItem>
                    <SelectItem value="moderator">{t('admin.management.users.roles.moderator')}</SelectItem>
                    <SelectItem value="admin">{t('admin.management.users.roles.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.management.users.form.permissions')}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Switch
                        checked={createForm.permissions.includes(permission)}
                        onCheckedChange={() => handlePermissionToggle(permission, true)}
                      />
                      <span className="text-sm">{t(`admin.management.users.permissions.${permission}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t('admin.management.users.buttons.cancel')}
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('admin.management.users.buttons.createUser')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.users.stats.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.users.stats.activeUsers')}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.activeUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.users.stats.adminUsers')}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.adminUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.management.users.stats.recentLogins')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.recentLogins || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.management.users.filter.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('admin.management.users.filter.filterByRole')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.management.users.filter.allRoles')}</SelectItem>
            <SelectItem value="admin">{t('admin.management.users.roles.admin')}</SelectItem>
            <SelectItem value="moderator">{t('admin.management.users.roles.moderator')}</SelectItem>
            <SelectItem value="manager">{t('admin.management.users.roles.manager')}</SelectItem>
            <SelectItem value="analyst">{t('admin.management.users.roles.analyst')}</SelectItem>
            <SelectItem value="user">{t('admin.management.users.roles.user')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.management.users.usersCount', { count: filteredUsers.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.management.users.table.user')}</TableHead>
                <TableHead>{t('admin.management.users.table.role')}</TableHead>
                <TableHead>{t('admin.management.users.table.status')}</TableHead>
                <TableHead>{t('admin.management.users.table.lastLogin')}</TableHead>
                <TableHead>{t('admin.management.users.table.permissions')}</TableHead>
                <TableHead>{t('admin.management.users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>
                      {t(`admin.management.users.roles.${user.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "secondary" : "destructive"}>
                      {user.isActive ? t('admin.management.users.status.active') : t('admin.management.users.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : t('admin.management.users.table.never')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(Array.isArray(user.permissions) ? user.permissions : Object.keys(user.permissions || {})).slice(0, 3).map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {t(`admin.management.users.permissions.${permission}`)}
                        </Badge>
                      ))}
                      {(Array.isArray(user.permissions) ? user.permissions : Object.keys(user.permissions || {})).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(Array.isArray(user.permissions) ? user.permissions : Object.keys(user.permissions || {})).length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'admin'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('admin.management.users.dialog.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('admin.management.users.dialog.editDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">{t('admin.management.users.form.username')}</Label>
              <Input
                id="edit-username"
                value={updateForm.username}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">{t('admin.management.users.form.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={updateForm.email}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">{t('admin.management.users.form.role')}</Label>
              <Select value={updateForm.role} onValueChange={(value) => setUpdateForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t('admin.management.users.roles.user')}</SelectItem>
                  <SelectItem value="analyst">{t('admin.management.users.roles.analyst')}</SelectItem>
                  <SelectItem value="manager">{t('admin.management.users.roles.manager')}</SelectItem>
                  <SelectItem value="moderator">{t('admin.management.users.roles.moderator')}</SelectItem>
                  <SelectItem value="admin">{t('admin.management.users.roles.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={updateForm.isActive}
                onCheckedChange={(checked) => setUpdateForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>{t('admin.management.users.form.activeUser')}</Label>
            </div>
            <div>
              <Label>{t('admin.management.users.form.permissions')}</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availablePermissions.map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Switch
                      checked={updateForm.permissions.includes(permission)}
                      onCheckedChange={() => handlePermissionToggle(permission, false)}
                    />
                    <span className="text-sm">{t(`admin.management.users.permissions.${permission}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('admin.management.users.buttons.cancel')}
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('admin.management.users.buttons.updateUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
