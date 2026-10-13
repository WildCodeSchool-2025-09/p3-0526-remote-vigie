import { forgetPushPromptAnswer } from "@/components/PushOptInBanner/pushOptInStorage";
import { setAuthToken, setOnUnauthorized } from "@/services/apiClient";
import { login as loginRequest, me as meRequest } from "@/services/authActions";
import pushService from "@/services/pushService";
import type { AuthUser } from "@/types/auth";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useState,
} from "react";
import type { ReactNode } from "react";

type AuthContextValue = {
	user: AuthUser | null;
	loading: boolean;
	login: (identifier: string, password: string) => Promise<void>;
	logout: () => void;
	loginWithToken: (token: string) => Promise<void>;
	updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	// Layout effects run before every child's useEffect: pages that fetch on
	// mount must already send the token, or the server treats them as visitors
	useLayoutEffect(() => {
		setAuthToken(localStorage.getItem("vigie_token"));
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("vigie_token");
		if (token == null) {
			setLoading(false);
			return;
		}

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
		try {
			const fetchedUser = await meRequest();
			if (fetchedUser == null) {
				throw new Error("Session invalide.");
			}
			setUser(fetchedUser);
		} catch (err) {
			// Token refusé, serveur en erreur ou réseau coupé : on ne garde pas
			// un token qu'on n'a pas pu valider.
			clearSession();
			throw err;
		}
	};

	const login = async (identifier: string, password: string) => {
		const { token } = await loginRequest(identifier, password);
		await loginWithToken(token);
	};

	// Ends the session without touching the push subscription: sessions last one
	// hour, so a 401 is routine and the device must keep receiving alerts
	const clearSession = useCallback(() => {
		localStorage.removeItem("vigie_token");
		setAuthToken(null);
		setUser(null);
	}, []);

	// Voluntary sign-out: the device also leaves the account, in the background
	// (the token is captured before the session is cleared)
	const logout = useCallback(() => {
		const token = localStorage.getItem("vigie_token");
		const userId = user?.id;
		clearSession();
		void pushService.release(token);
		if (userId != null) forgetPushPromptAnswer(userId);
	}, [user, clearSession]);

	useEffect(() => {
		setOnUnauthorized(clearSession);
		return () => setOnUnauthorized(null);
	}, [clearSession]);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				loginWithToken,
				logout,
				// Ignoré si la session s'est terminée entre-temps (réponse tardive)
				updateUser: (updated) =>
					setUser((current) => current && updated),
			}}
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
