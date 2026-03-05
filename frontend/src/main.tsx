import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kilasy from './pages/Kilasy';
import Registre from './pages/Registre';
import Stats from './pages/Stats';
import KilasyLasitra from './pages/KilasyLasitra';
import Users from './pages/Users';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AdminLayout from './components/AdminLayout';
import { Outlet } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <MantineProvider defaultColorScheme="auto">
      <Notifications position="top-right" />
      <DatesProvider settings={{ locale: 'fr', firstDayOfWeek: 1, weekendDays: [0] }}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute />
                }
              >
                <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="kilasy" element={<Kilasy />} />
                <Route path="kilasy-lasitra" element={<KilasyLasitra />} />
                <Route path="registre" element={<Registre />} />
                <Route path="stats" element={<Stats />} />
                <Route path="users" element={<Users />} />
              </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </DatesProvider>
    </MantineProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
