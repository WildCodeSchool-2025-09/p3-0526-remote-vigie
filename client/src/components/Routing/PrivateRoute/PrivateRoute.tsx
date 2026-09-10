import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router";

export default function PrivateRoute() {
	const { user, loading } = useAuth();

	if (loading) {
		return null;
	}

	if (user == null) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
