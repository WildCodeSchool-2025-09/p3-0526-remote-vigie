import { useEffect, useState } from "react";

import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/auth/AuthContext";
import { getWeatherVigilance } from "@/services/vigilanceService";
import type { VigilanceLevel, WeatherVigilance } from "@/types/vigilance";
import { formatTime } from "@/utils/formatDate";

// Rayures : couleurs vives de la maquette (décoratif). Texte : jetons AA du thème.
const LEVEL_STYLES: Record<
	VigilanceLevel,
	{
		label: string;
		advice: string;
		stripe: string;
		text: string;
		icon: string;
	}
> = {
	yellow: {
		label: "Vigilance jaune",
		advice: "Soyez attentif : des phénomènes habituels dans la région mais occasionnellement dangereux sont prévus.",
		stripe: "#e0a81f",
		text: "text-(--level-3)",
		icon: "fill-(--level-3)",
	},
	orange: {
		label: "Vigilance orange",
		advice: "Soyez très vigilant : des phénomènes dangereux sont prévus.",
		stripe: "#e8600f",
		text: "text-(--level-4)",
		icon: "fill-(--level-4)",
	},
	red: {
		label: "Vigilance rouge",
		advice: "Vigilance absolue : des phénomènes dangereux d'intensité exceptionnelle sont prévus.",
		stripe: "#c1392b",
		text: "text-(--level-5)",
		icon: "fill-(--level-5)",
	},
};

export default function WeatherBanner() {
	const { user } = useAuth();
	const userId = user?.id;
	const [isLoading, setIsLoading] = useState(true);
	const [vigilance, setVigilance] = useState<WeatherVigilance | null>(null);

	useEffect(() => {
		if (userId == null) return;

		let cancelled = false;
		setIsLoading(true);

		getWeatherVigilance().then((result) => {
			if (cancelled) return;
			setVigilance(result);
			setIsLoading(false);
		});

		return () => {
			cancelled = true;
		};
	}, [userId]);

	if (userId == null) return null;

	if (isLoading) {
		return (
			<div
				aria-hidden="true"
				className="flex gap-3 rounded-2xl bg-(--bg-light) p-4 shadow-sm"
			>
				<div className="skeleton h-5 w-5 shrink-0 rounded-full" />
				<div className="flex flex-1 flex-col gap-2">
					<div className="skeleton h-4 w-2/3 rounded-full" />
					<div className="skeleton h-3 w-full rounded-full" />
				</div>
			</div>
		);
	}

	if (vigilance == null) return null;

	const style = LEVEL_STYLES[vigilance.level];
	const source = [
		"Météo-France",
		vigilance.updatedAt && `relevé à ${formatTime(vigilance.updatedAt)}`,
		`d'après votre adresse (${vigilance.city})`,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<output className="flex overflow-hidden rounded-2xl bg-(--bg-light) shadow-sm">
			<span
				aria-hidden="true"
				className="w-2.5 shrink-0"
				style={{
					backgroundImage: `repeating-linear-gradient(135deg, ${style.stripe} 0 4px, transparent 4px 8px)`,
				}}
			/>
			<div className="flex min-w-0 flex-1 items-start gap-3 p-4">
				<Icon
					name="info"
					className={`h-5 w-5 shrink-0 ${style.icon}`}
					aria-hidden="true"
				/>
				<div className="min-w-0 text-sm text-black">
					<p>
						<strong
							className={`font-bold uppercase tracking-wide ${style.text}`}
						>
							{style.label}
						</strong>{" "}
						<span className="font-bold">
							Département {vigilance.department}
						</span>
					</p>
					<p className="mt-1">{style.advice}</p>
					<p className="mt-1 text-xs text-black/60">{source}</p>
				</div>
			</div>
		</output>
	);
}
