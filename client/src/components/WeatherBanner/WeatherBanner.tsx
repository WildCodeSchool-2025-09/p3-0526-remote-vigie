import Icon from "@/components/Icon/Icon";
import type { VigilanceLevel, WeatherVigilance } from "@/types/vigilance";
import {
	formatEndTime,
	formatParisTime,
	formatPhenomena,
} from "@/utils/vigilanceText";

// Rayures : couleurs vives de la maquette (décoratif). Texte : jetons AA du thème.
const LEVEL_STYLES: Record<
	VigilanceLevel,
	{
		label: string;
		advice: string;
		shortAdvice: string;
		stripe: string;
		text: string;
		icon: string;
	}
> = {
	yellow: {
		label: "Vigilance jaune",
		advice: "Soyez attentif : des phénomènes habituels dans la région mais occasionnellement dangereux sont prévus.",
		shortAdvice: "Soyez attentif.",
		stripe: "#e0a81f",
		text: "text-(--level-3)",
		icon: "fill-(--level-3)",
	},
	orange: {
		label: "Vigilance orange",
		advice: "Soyez très vigilant : des phénomènes dangereux sont prévus.",
		shortAdvice: "Soyez très vigilant.",
		stripe: "#e8600f",
		text: "text-(--level-4)",
		icon: "fill-(--level-4)",
	},
	red: {
		label: "Vigilance rouge",
		advice: "Vigilance absolue : des phénomènes dangereux d'intensité exceptionnelle sont prévus.",
		shortAdvice: "Vigilance absolue.",
		stripe: "#c1392b",
		text: "text-(--level-5)",
		icon: "fill-(--level-5)",
	},
};

type WeatherBannerProps = {
	isLoading: boolean;
	vigilance: WeatherVigilance | null;
};

export default function WeatherBanner({
	isLoading,
	vigilance,
}: WeatherBannerProps) {
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
	const place = vigilance.departmentName
		? `${vigilance.departmentName} (${vigilance.department})`
		: `Département ${vigilance.department}`;

	// "Vent violent et orages jusqu'à demain 6 h." ; null s'il n'y a aucun phénomène.
	const phenomenaText = formatPhenomena(vigilance.phenomena);
	const endText = vigilance.endTime ? formatEndTime(vigilance.endTime) : null;
	const forecast = phenomenaText
		? `${[phenomenaText, endText].filter(Boolean).join(" ")}.`
		: null;

	const source = [
		"Météo-France",
		vigilance.updatedAt &&
			`relevé à ${formatParisTime(vigilance.updatedAt)}`,
		`d'après votre adresse (${vigilance.city}, ${vigilance.department})`,
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
						<span className="font-bold">{place}</span>
					</p>
					<p className="mt-1">
						{forecast
							? `${forecast} ${style.shortAdvice}`
							: style.advice}
					</p>
					<p className="mt-1 text-xs text-black/60">{source}</p>
				</div>
			</div>
		</output>
	);
}
