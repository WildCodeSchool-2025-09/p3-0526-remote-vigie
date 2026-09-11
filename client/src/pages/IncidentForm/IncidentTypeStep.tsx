import IncidentTypePicker from "@/components/Form/IncidentTypePicker/IncidentTypePicker";
import SafetyInstructions, {
	type SafetyInstructionsItem,
} from "@/components/SafetyInstructions/SafetyInstructions";
import type { IncidentType } from "@/types/incidentForm";

type IncidentTypeStepProps = {
	incidentTypes: IncidentType[];
	selectedTypes: number[];
	onSelectedTypesChange: (ids: number[]) => void;
	loadingTypes: boolean;
	typesError: string | null;
	onRetry: () => void;
	selectedTypesInstructions: SafetyInstructionsItem[];
};

export default function IncidentTypeStep({
	incidentTypes,
	selectedTypes,
	onSelectedTypesChange,
	loadingTypes,
	typesError,
	onRetry,
	selectedTypesInstructions,
}: IncidentTypeStepProps) {
	return (
		<section className="rounded-2xl bg-base-200 p-4">
			<div className="flex items-center gap-2 pb-8">
				<span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-content">
					1
				</span>
				<h2 className="font-title text-lg font-bold text-primary">
					Que voulez-vous signaler ?
				</h2>
			</div>
			{loadingTypes && <p>Chargement des types…</p>}
			{typesError && (
				<div className="text-center">
					<p role="alert" className="m-2 ">
						{typesError}
					</p>
					<button
						type="button"
						className="btn btn-accent btn-md w-full grow rounded-full border-none px-5 font-bold"
						onClick={onRetry}
					>
						Réessayer
					</button>
				</div>
			)}
			{!loadingTypes && !typesError && (
				<>
					<IncidentTypePicker
						incidentTypes={incidentTypes}
						value={selectedTypes}
						onChange={onSelectedTypesChange}
					/>
					<SafetyInstructions incidentTypes={selectedTypesInstructions} />
				</>
			)}
		</section>
	);
}
