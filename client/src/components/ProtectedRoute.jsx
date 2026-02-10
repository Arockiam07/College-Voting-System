import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
var ProtectedRoute_default = ProtectedRoute;
export {
  ProtectedRoute_default as default
};
