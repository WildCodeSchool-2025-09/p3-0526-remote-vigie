import type { IncidentType } from "@/types/incidentForm";
import { useId } from "react";

type IncidentTypePickerProps = {
	incidentTypes: IncidentType[];
	value: number[];
	onChange: (ids: number[]) => void;
	error?: string | null;
};

export default function IncidentTypePicker({
	incidentTypes,
	value,
	onChange,
	error,
}: IncidentTypePickerProps) {
	const errorId = useId();

	function toggleType(id: number) {
		const next = value.includes(id)
			? value.filter((typeId) => typeId !== id)
			: [...value, id];

		onChange(next);
	}

	return (
		<fieldset aria-describedby={error ? errorId : undefined}>
			<legend>Type d'incident</legend>

			{incidentTypes.map((type) => (
				<label key={type.id}>
					<input
						type="checkbox"
						checked={value.includes(type.id)}
						onChange={() => toggleType(type.id)}
					/>
					{type.label}
				</label>
			))}

			{error && (
				<p id={errorId} role="alert">
					{error}
				</p>
			)}
		</fieldset>
	);
}
