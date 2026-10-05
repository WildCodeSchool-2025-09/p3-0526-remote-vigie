import { setAuthToken, setOnUnauthorized } from "@/services/apiClient";
import { login as loginRequest, me as meRequest } from "@/services/authActions";
import type { AuthUser } from "@/types/auth";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { ReactNode } from "react";

type AuthContextValue = {
	user: AuthUser | null;
	loading: boolean;
	login: (identifier: string, password: string) => Promise<void>;
	logout: () => void;
	loginWithToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("vigie_token");
		if (token == null) {
			setLoading(false);
			return;
		}

		setAuthToken(token);
		meRequest()
			.then((fetchedUser) => {
				if (fetchedUser == null) {
					localStorage.removeItem("vigie_token");
					setAuthToken(null);
				}
				setUser(fetchedUser);
			})
			.catch(() => {
				setAuthToken(null);
				setUser(null);
			})
			.finally(() => setLoading(false));
	}, []);

	const loginWithToken = async (token: string) => {
		localStorage.setItem("vigie_token", token);
		setAuthToken(token);
		const fetchedUser = await meRequest();
		if (fetchedUser == null) {
			throw new Error("Session invalide.");
		}
		setUser(fetchedUser);
	};

	const login = async (identifier: string, password: string) => {
		const { token } = await loginRequest(identifier, password);
		await loginWithToken(token);
	};

	const logout = useCallback(() => {
		localStorage.removeItem("vigie_token");
		setAuthToken(null);
		setUser(null);
	}, []);

	useEffect(() => {
		setOnUnauthorized(logout);
		return () => setOnUnauthorized(null);
	}, [logout]);

	return (
		<AuthContext.Provider
			value={{ user, loading, login, loginWithToken, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context == null) {
		throw new Error("useAuth doit être utilisé dans un AuthProvider");
	}
	return context;
}
