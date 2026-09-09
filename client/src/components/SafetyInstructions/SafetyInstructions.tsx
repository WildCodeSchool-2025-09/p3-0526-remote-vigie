import Icon from "@/components/Icon/Icon";
import type { IncidentType } from "@/types/incidentForm";
import { useId, useState } from "react";

type SafetyInstructionsProps = {
	incidentTypes: IncidentType[];
	value: number[];
};

export default function SafetyInstructions({
	incidentTypes,
	value,
}: SafetyInstructionsProps) {
	const [isOpen, setIsOpen] = useState(true);
	const panelId = useId();
	const instructions = incidentTypes.filter(
		(type) => value.includes(type.id) && type.safety_instructions !== null,
	);

	if (instructions.length === 0) {
		return null;
	}

	return (
		<section>
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-expanded={isOpen}
				aria-controls={panelId}
			>
				<Icon name="shield" />
				<span>Consignes de sécurité ({instructions.length})</span>
				<Icon name={isOpen ? "angleSmallUp" : "angleSmallDown"} />
			</button>
			{isOpen && (
				<div id={panelId}>
					{instructions.map((type) => (
						<p key={type.id}>
							<strong style={{ color: type.color }}>
								{type.label} —{" "}
							</strong>
							{type.safety_instructions}
						</p>
					))}
				</div>
			)}
		</section>
	);
}
