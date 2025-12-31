import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Containers } from '@/pages/Containers';
import { Alerts } from '@/pages/Alerts';
import { Users } from '@/pages/Users';
import { CoreServices } from '@/pages/CoreServices';
import { RayanaraAI } from '@/pages/RayanaraAI';
import { Infrastructure } from '@/pages/Infrastructure';
import { Mololink } from '@/pages/Mololink';
import { Communications } from '@/pages/Communications';
import { Workflows } from '@/pages/Workflows';
import { CMS } from '@/pages/CMS';
import { Settings } from '@/pages/Settings';
import { Metrics } from '@/pages/Metrics';
import { Logs } from '@/pages/Logs';
import { Security } from '@/pages/Security';
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
          <Route path="/core" element={<CoreServices />} />
          <Route path="/rayanava" element={<RayanaraAI />} />
          <Route path="/infrastructure" element={<Infrastructure />} />
          <Route path="/mololink" element={<Mololink />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/cms" element={<CMS />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/security" element={<Security />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
