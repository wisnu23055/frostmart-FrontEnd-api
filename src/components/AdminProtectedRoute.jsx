import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminProtectedRoute({ children }) {
  const isLogin = useSelector((state) => state.auth.isLogin);
  const user = useSelector((state) => state.auth.user);

  if (!isLogin) {
    return <Navigate to="/login" />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}

export default AdminProtectedRoute;
