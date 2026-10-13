import { useCallback, useEffect, useState } from "react";

// Valeur qui ne suit `value` qu'après `delayMs` sans changement ; `flush` la
// rattrape tout de suite (validation avec Entrée).
export function useDebouncedValue<T>(
	value: T,
	delayMs: number,
): [T, () => void] {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(timer);
	}, [value, delayMs]);

	const flush = useCallback(() => setDebounced(value), [value]);

	return [debounced, flush];
}
