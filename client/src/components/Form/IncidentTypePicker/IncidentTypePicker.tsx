import type { IconName } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
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
			<div className="flex flex-wrap gap-x-3 gap-y-6">
				{incidentTypes.map((type) => {
					const isSelected = value.includes(type.id);

					return (
						<button
							key={type.id}
							type="button"
							aria-pressed={isSelected}
							onClick={() => toggleType(type.id)}
							className="min-w-0 basis-[calc((100%-1.5rem)/3)]"
						>
							<div
								className="relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border bg-base-300 p-3"
								style={
									isSelected
										? {
												borderColor: `var(--${type.icon})`,
												backgroundColor: `var(--bg-${type.icon})`,
											}
										: {
												borderColor:
													"var(--primary-light)",
											}
								}
							>
								<Icon
									name={type.icon as IconName}
									className={`-mt-8 ${isSelected ? "h-16 w-16" : "h-14 w-14"}`}
								/>
								<span className="pt-1 text-xs">
									{type.label}
								</span>
							</div>
						</button>
					);
				})}
			</div>

			{error && (
				<p id={errorId} role="alert">
					{error}
				</p>
			)}
		</fieldset>
	);
}
