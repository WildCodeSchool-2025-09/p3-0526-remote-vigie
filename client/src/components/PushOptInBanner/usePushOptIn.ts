import {
	hasAnsweredPushPrompt,
	hasClosedInstallHint,
	markInstallHintClosed,
	markPushPromptAnswered,
} from "@/components/PushOptInBanner/pushOptInStorage";
import { useAuth } from "@/contexts/auth/AuthContext";
import pushService from "@/services/pushService";
import { useCallback, useEffect, useState } from "react";

// "install": iOS device without the app installed, show how to add it instead
export type PushOptInMode = "activate" | "install";

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

	// Only a technical failure is not an answer: keep the banner to retry
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

	const dismiss = useCallback(() => {
		if (userId == null) return;
		if (mode === "install") markInstallHintClosed(userId);
		else markPushPromptAnswered(userId);
		setMode(null);
	}, [userId, mode]);

	return { mode, visible: mode != null, accepting, error, accept, dismiss };
}
