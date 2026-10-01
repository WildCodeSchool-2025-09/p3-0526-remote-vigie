import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router";

export default function PrivateRoute() {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return null;
	}

	if (user == null) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
}
