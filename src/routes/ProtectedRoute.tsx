import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // atau loading spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
