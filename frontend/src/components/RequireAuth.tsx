import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** A component that protects routes by requiring authentication. */
export function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
