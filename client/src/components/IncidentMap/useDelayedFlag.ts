import { useEffect, useRef, useState } from "react";

// Vrai seulement si `active` dure plus de `delayMs`, puis maintenu au moins
// `minVisibleMs` : les chargements rapides ne font pas clignoter un message.
export function useDelayedFlag(
	active: boolean,
	delayMs: number,
	minVisibleMs: number,
): boolean {
	const [visible, setVisible] = useState(false);
	const shownAtRef = useRef(0);

	useEffect(() => {
		if (active) {
			const showTimer = setTimeout(() => {
				shownAtRef.current = Date.now();
				setVisible(true);
			}, delayMs);
			return () => clearTimeout(showTimer);
		}

		const remaining = Math.max(
			0,
			minVisibleMs - (Date.now() - shownAtRef.current),
		);
		const hideTimer = setTimeout(() => setVisible(false), remaining);
		return () => clearTimeout(hideTimer);
	}, [active, delayMs, minVisibleMs]);

	return visible;
}
