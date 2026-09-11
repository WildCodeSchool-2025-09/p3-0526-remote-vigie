import DangerLevelPicker, {
	type DangerLevel,
} from "@/components/Form/DangerLevelPicker/DangerLevelPicker";

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
	return (
		<section className="rounded-2xl bg-base-200 p-4">
			<div className="flex justify-between">
				<div className="flex items-center gap-2 pb-4">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-content">
						2
					</span>
					<h2 className="font-title text-lg font-bold text-primary">
						Détails
					</h2>
				</div>
				<p className="text-neutral ">Facultatif</p>
			</div>

			<DangerLevelPicker
				label="Quelle est la gravité de la situation ?"
				dangerLevels={dangerLevels}
				value={dangerLevel}
				onChange={onDangerLevelChange}
			/>
		</section>
	);
}
