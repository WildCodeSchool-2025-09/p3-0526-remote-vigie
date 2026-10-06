import { markPushPromptAnswered } from "@/components/PushOptInBanner/pushOptInStorage";
import { useAuth } from "@/contexts/auth/AuthContext";
import pushService, { type PushPermission } from "@/services/pushService";
import { useCallback, useEffect, useState } from "react";

type PushSettingsState = {
	permission: PushPermission;
	subscribed: boolean;
	needsInstall: boolean;
};

// Réglage des notifications push de l'appareil courant, dans le profil (US21).
// `state` reste null tant que l'état de l'appareil n'est pas connu.
export function usePushSettings() {
	const { user } = useAuth();
	const userId = user?.id ?? null;
	const [state, setState] = useState<PushSettingsState | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		const needsInstall = pushService.needsInstallToPush();
		const permission = pushService.getPermission();
		const subscribed =
			permission === "unsupported"
				? false
				: await pushService.isSubscribed();
		setState({ permission, subscribed, needsInstall });
	}, []);

	useEffect(() => {
		let cancelled = false;
		const update = () => {
			if (!cancelled) refresh().catch(() => {});
		};
		update();

		// L'utilisateur peut rétablir l'autorisation dans les réglages du navigateur
		// puis revenir : on se remet à jour sans qu'il ait à recharger la page.
		window.addEventListener("focus", update);
		let permissionStatus: PermissionStatus | null = null;
		if (pushService.isPushSupported() && navigator.permissions?.query) {
			navigator.permissions
				.query({ name: "notifications" })
				.then((status) => {
					if (cancelled) return;
					permissionStatus = status;
					status.addEventListener("change", update);
				})
				.catch(() => {});
		}

		return () => {
			cancelled = true;
			window.removeEventListener("focus", update);
			permissionStatus?.removeEventListener("change", update);
		};
	}, [refresh]);

	const toggle = useCallback(async () => {
		if (state == null || userId == null) return;
		setBusy(true);
		setError(null);
		try {
			if (state.subscribed) {
				await pushService.unsubscribe();
			} else {
				await pushService.subscribe();
			}
			// L'utilisateur a choisi depuis le profil : l'encart n'a plus à le
			// solliciter, y compris s'il désactive ensuite.
			markPushPromptAnswered(userId);
		} catch {
			setError(
				state.subscribed
					? "La désactivation a échoué. Réessayez dans un instant."
					: "L'activation a échoué. Réessayez dans un instant.",
			);
		} finally {
			await refresh().catch(() => {});
			setBusy(false);
		}
	}, [state, userId, refresh]);

	return { state, busy, error, toggle };
}
