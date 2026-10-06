import {
	hasAnsweredPushPrompt,
	hasClosedInstallHint,
	markInstallHintClosed,
	markPushPromptAnswered,
} from "@/components/PushOptInBanner/pushOptInStorage";
import { useAuth } from "@/contexts/auth/AuthContext";
import pushService from "@/services/pushService";
import { useCallback, useEffect, useState } from "react";

// "activate" : proposer d'activer les notifications.
// "install" : iPhone ou iPad où Vigie n'est pas installé, on explique comment
// l'ajouter à l'écran d'accueil à la place.
export type PushOptInMode = "activate" | "install";

// Logique de l'encart d'activation (US21). Il est proposé à un utilisateur
// connecté qui n'a pas encore répondu sur cet appareil, si le navigateur prend
// en charge le push, que l'autorisation n'est pas déjà refusée dans ses
// réglages (on ne peut plus la redemander, le profil l'explique) et que
// l'appareil n'est pas déjà abonné.
export function usePushOptIn() {
	const { user } = useAuth();
	const userId = user?.id ?? null;
	const [mode, setMode] = useState<PushOptInMode | null>(null);
	const [accepting, setAccepting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setMode(null);
		if (userId == null) return;

		if (pushService.needsInstallToPush()) {
			if (!hasClosedInstallHint(userId)) setMode("install");
			return;
		}

		if (hasAnsweredPushPrompt(userId)) return;
		if (!pushService.isPushSupported()) return;
		if (pushService.getPermission() === "denied") return;

		let cancelled = false;
		pushService
			.isSubscribed()
			.then((subscribed) => {
				if (!cancelled) setMode(subscribed ? null : "activate");
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
			markPushPromptAnswered(userId);
			setMode(null);
		} catch {
			setError("L'activation a échoué. Réessayez dans un instant.");
		} finally {
			setAccepting(false);
		}
	}, [userId]);

	// « Plus tard » (activation) ou « J'ai compris » (installation iOS).
	const dismiss = useCallback(() => {
		if (userId == null) return;
		if (mode === "install") markInstallHintClosed(userId);
		else markPushPromptAnswered(userId);
		setMode(null);
	}, [userId, mode]);

	return { mode, visible: mode != null, accepting, error, accept, dismiss };
}
