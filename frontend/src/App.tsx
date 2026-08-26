import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { CreatePlaybookPage } from './pages/CreatePlaybookPage';
import { SimulateEventPage } from './pages/SimulateEventPage';

// The main App component that sets up routing and authentication context for the application.
export function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/playbooks/new"
          element={
            <RequireAuth>
              <CreatePlaybookPage />
            </RequireAuth>
          }
        />
        <Route
          path="/simulate"
          element={
            <RequireAuth>
              <SimulateEventPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
