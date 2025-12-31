import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users as UsersIcon,
  UserPlus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Shield,
  Mail,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
}

const ROLES = ['super_admin', 'admin', 'viewer'];

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  admin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  viewer: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  viewer: 'Viewer',
};

function UserModal({
  user,
  onClose,
  onSave,
  isSaving,
}: {
  user?: AdminUser | null;
  onClose: () => void;
  onSave: (data: { username: string; email: string; password?: string; role: string }) => void;
  isSaving: boolean;
}) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ username, email, password: password || undefined, role });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" data-testid="btn-close-modal">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              required
              data-testid="input-username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              required
              data-testid="input-email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password {user && <span className="text-slate-400 font-normal">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              placeholder={user ? '••••••••' : ''}
              required={!user}
              data-testid="input-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              data-testid="select-role"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
              data-testid="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              data-testid="btn-save-user"
            >
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
              {user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onConfirm, isDeleting }: { user: AdminUser; onClose: () => void; onConfirm: () => void; isDeleting: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete User?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to delete <strong>{user.username}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium" data-testid="btn-cancel-delete">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            data-testid="btn-confirm-delete"
          >
            {isDeleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function Users() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: getAdminUsers,
  });

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { username?: string; email?: string; role?: string } }) => updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setDeletingUser(null);
    },
  });

  const users: AdminUser[] = data?.users || [];
  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (formData: { username: string; email: string; password?: string; role: string }) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, password: formData.password || '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage admin panel users and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            data-testid="btn-add-user"
          >
            <UserPlus size={16} />
            Add User
          </button>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            data-testid="btn-refresh-users"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg"><UsersIcon size={24} className="text-blue-500" /></div>
          <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p><p className="text-sm text-slate-500">Total Users</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg"><Shield size={24} className="text-purple-500" /></div>
          <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{users.filter((u) => u.role === 'super_admin').length}</p><p className="text-sm text-slate-500">Super Admins</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg"><Mail size={24} className="text-green-500" /></div>
          <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{users.filter((u) => u.role === 'admin').length}</p><p className="text-sm text-slate-500">Admins</p></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              data-testid="input-search-users"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="animate-spin mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle size={32} className="mx-auto text-orange-500 mb-4" />
            <p className="text-slate-500">Failed to load users. The backend may not support user management yet.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <UsersIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-500 font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 dark:text-white">{user.username}</h3>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
                <span className={cn('px-3 py-1 text-xs font-medium rounded-full border mr-4', ROLE_COLORS[user.role] || ROLE_COLORS.viewer)}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500"
                    title="Edit"
                    data-testid={`btn-edit-${user.id}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingUser(user)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500"
                    title="Delete"
                    data-testid={`btn-delete-${user.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showModal || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSave={handleSave}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => deleteMutation.mutate(deletingUser.id)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
