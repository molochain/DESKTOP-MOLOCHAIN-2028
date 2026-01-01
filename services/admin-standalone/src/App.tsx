import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Containers } from '@/pages/Containers';
import { Alerts } from '@/pages/Alerts';
import { Users } from '@/pages/Users';
import { Services } from '@/pages/Services';
import { Settings } from '@/pages/Settings';
import { Metrics } from '@/pages/Metrics';
import { Logs } from '@/pages/Logs';
import { Security } from '@/pages/Security';
import Database from '@/pages/Database';
import ApiDocs from '@/pages/ApiDocs';
import AuditLogs from '@/pages/AuditLogs';
import Runbooks from '@/pages/Runbooks';
import { Incidents } from '@/pages/Incidents';
import { Analytics } from '@/pages/Analytics';
import { useAuth } from '@/hooks/useAuth';

export default function App() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={login} />
        } />
        <Route element={<Layout isAuthenticated={isAuthenticated} username={user?.username} onLogout={logout} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/users" element={<Users />} />
          <Route path="/services" element={<Services />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/security" element={<Security />} />
          <Route path="/database" element={<Database />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/runbooks" element={<Runbooks />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
