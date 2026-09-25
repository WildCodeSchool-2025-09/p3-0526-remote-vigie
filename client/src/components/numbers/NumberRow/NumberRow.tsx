import Icon from "@/components/Icon/Icon";
import type { EmergencyNumber } from "@/types/numbers";

type Props = {
	entry: EmergencyNumber;
};

export default function NumberRow({ entry }: Props) {
	const dialNumber = entry.number.replace(/\s/g, "");
	const href =
		entry.action === "sms" ? `sms:${dialNumber}` : `tel:${dialNumber}`;
	const label = entry.action === "sms" ? "SMS" : "Appeler";
	const ariaLabel =
		entry.action === "sms"
			? `Envoyer un SMS à ${entry.name} : ${entry.number}`
			: `Appeler ${entry.name} : ${entry.number}`;

	return (
		<section className="flex items-center gap-3 rounded-2xl bg-base-300 p-4">
			<p className="w-16 shrink-0 text-center font-title text-2xl font-bold text-error">
				{entry.number}
			</p>

			<div className="min-w-0 flex-1">
				<p className="font-bold text-primary">{entry.name}</p>
				<p className="mt-0.5 text-xs text-primary/50">
					{entry.description}
				</p>
			</div>

			<a
				href={href}
				aria-label={ariaLabel}
				className={
					entry.action === "sms"
						? "btn btn-sm shrink-0 gap-1.5 rounded-full border-2 border-primary bg-transparent px-4 font-bold text-primary shadow-none hover:bg-primary/10"
						: "btn btn-accent btn-sm shrink-0 gap-1.5 rounded-full border-none px-4 font-bold"
				}
			>
				{entry.action === "call" && (
					<Icon
						name="phoneFlip"
						className="h-3.5 w-3.5 fill-primary"
						aria-hidden="true"
					/>
				)}
				{label}
			</a>
		</section>
	);
}
