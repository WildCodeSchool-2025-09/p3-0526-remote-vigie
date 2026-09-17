import Icon from "@/components/Icon/Icon";
import { useId, useState } from "react";

export type SafetyInstructionsItem = {
	code: string;
	label: string;
	color: string;
	safetyInstructions: string | null;
};

type Props = {
	incidentTypes: SafetyInstructionsItem[];
};

export default function SafetyInstructions({ incidentTypes }: Props) {
	const [isOpen, setIsOpen] = useState(true);
	const panelId = useId();

	const instructions = incidentTypes.filter(
		(type) => type.safetyInstructions != null,
	);

	if (instructions.length === 0) {
		return null;
	}

	return (
		<div className="rounded-2xl bg-(--primary-light) mt-4 p-4">
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-expanded={isOpen}
				aria-controls={panelId}
				className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
			>
				<span className="flex items-center gap-2">
					<Icon
						name="shield"
						className="h-4 w-4 fill-success"
						aria-hidden="true"
					/>
					<h2 className="font-title text-lg font-bold text-primary">
						Consignes de sécurité ({instructions.length})
					</h2>
				</span>
				<Icon
					name="angleSmallDown"
					className={`h-4 w-4 fill-primary/60 transition-transform duration-300 ${
						isOpen ? "rotate-180" : ""
					}`}
					aria-hidden="true"
				/>
			</button>

			<div
				className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
					isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
				}`}
			>
				<div className="overflow-hidden">
					<div
						id={panelId}
						aria-hidden={!isOpen}
						className="mt-3 space-y-3 border-t border-primary/10 pt-3 text-sm leading-relaxed"
					>
						{instructions.map((type) => (
							<p key={type.code}>
								<span
									className="font-bold"
									style={{ color: type.color }}
								>
									{type.label}
								</span>
								<span className="text-black">
									{" "}
									— {type.safetyInstructions}
								</span>
							</p>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
