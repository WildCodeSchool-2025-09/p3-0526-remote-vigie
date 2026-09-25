import { useMemo } from "react";

export type PasswordStrength = {
	score: number;
	label: string;
};

const LABELS = ["Faible", "Faible", "Moyen", "Fort", "Robuste"];

export default function usePasswordStrength(
	password: string,
): PasswordStrength {
	return useMemo(() => {
		let score = 0;

		if (password.length >= 8) score += 1;
		if (/[A-Z]/.test(password)) score += 1;
		if (/[0-9]/.test(password)) score += 1;
		if (/[^A-Za-z0-9]/.test(password)) score += 1;

		return { score, label: LABELS[score] };
	}, [password]);
}
