import type { IncidentType } from "@/types/incidentForm";

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
	function toggleType(id: number) {
		const next = value.includes(id)
			? value.filter((typeId) => typeId !== id)
			: [...value, id];

		onChange(next);
	}

	return (
		<fieldset>
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

			{error && <p role="alert">{error}</p>}
		</fieldset>
	);
}
