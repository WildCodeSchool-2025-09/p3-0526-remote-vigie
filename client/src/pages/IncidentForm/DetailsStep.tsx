import DangerLevelPicker, {
	type DangerLevel,
} from "@/components/Form/DangerLevelPicker/DangerLevelPicker";
import Icon from "@/components/Icon/Icon";
import { useId, useState } from "react";

type DetailsStepProps = {
	dangerLevels: DangerLevel[];
	dangerLevel: number | null;
	onDangerLevelChange: (id: number) => void;
};

export default function DetailsStep({
	dangerLevels,
	dangerLevel,
	onDangerLevelChange,
}: DetailsStepProps) {
	const [isOpen, setIsOpen] = useState(false);
	const panelId = useId();

	return (
		<section className="rounded-2xl bg-base-200 p-4">
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-expanded={isOpen}
				aria-controls={panelId}
				className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
			>
				<span className="flex items-center gap-2 pb-4">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-content">
						2
					</span>
					<h2 className="font-title text-lg font-bold text-primary">
						Détails
					</h2>
				</span>
				<span className="flex items-center gap-2 pb-4">
					<span className="text-neutral">Facultatif</span>
					<Icon
						name={isOpen ? "angleSmallUp" : "angleSmallDown"}
						className="h-4 w-4 fill-primary/60"
						aria-hidden="true"
					/>
				</span>
			</button>

			{isOpen && (
				<div id={panelId}>
					<DangerLevelPicker
						label="Quelle est la gravité de la situation ?"
						dangerLevels={dangerLevels}
						value={dangerLevel}
						onChange={onDangerLevelChange}
					/>
				</div>
			)}
		</section>
	);
}
