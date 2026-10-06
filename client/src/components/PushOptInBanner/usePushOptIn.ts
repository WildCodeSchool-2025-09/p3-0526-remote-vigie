import { useAuth } from "@/contexts/auth/AuthContext";
import pushService from "@/services/pushService";
import { useCallback, useEffect, useState } from "react";

// La réponse est mémorisée par appareil (le push est une décision par appareil)
// et par utilisateur (deux comptes sur un même navigateur ont chacun la leur).
const storageKey = (userId: number) => `vigie_push_prompt_${userId}`;

function hasAnswered(userId: number): boolean {
	try {
		return localStorage.getItem(storageKey(userId)) != null;
	} catch {
		return false;
	}
}

function markAnswered(userId: number) {
	try {
		localStorage.setItem(storageKey(userId), "answered");
	} catch {
		// Stockage indisponible : l'encart pourra revenir, sans conséquence grave.
	}
}

// Logique de l'encart d'activation (US21). Il est proposé à un utilisateur
// connecté qui n'a pas encore répondu sur cet appareil, si le navigateur prend
// en charge le push, que l'autorisation n'est pas déjà refusée dans ses
// réglages (on ne peut plus la redemander, le profil l'explique) et que
// l'appareil n'est pas déjà abonné.
export function usePushOptIn() {
	const { user } = useAuth();
	const userId = user?.id ?? null;
	const [visible, setVisible] = useState(false);
	const [accepting, setAccepting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setVisible(false);
		if (userId == null || hasAnswered(userId)) return;
		if (!pushService.isPushSupported()) return;
		if (pushService.getPermission() === "denied") return;

		let cancelled = false;
		pushService
			.isSubscribed()
			.then((subscribed) => {
				if (!cancelled) setVisible(!subscribed);
			})
			.catch(() => {});

		return () => {
			cancelled = true;
		};
	}, [userId]);

	// Accepter, refuser dans la fenêtre du navigateur ou la fermer comptent
	// toutes comme une réponse. Seule une panne technique n'en est pas une : on
	// garde l'encart pour que l'utilisateur puisse réessayer.
	const accept = useCallback(async () => {
		if (userId == null) return;
		setAccepting(true);
		setError(null);
		try {
			await pushService.subscribe();
			markAnswered(userId);
			setVisible(false);
		} catch {
			setError("L'activation a échoué. Réessayez dans un instant.");
		} finally {
			setAccepting(false);
		}
	}, [userId]);

	const dismiss = useCallback(() => {
		if (userId == null) return;
		markAnswered(userId);
		setVisible(false);
	}, [userId]);

	return { visible, accepting, error, accept, dismiss };
}
