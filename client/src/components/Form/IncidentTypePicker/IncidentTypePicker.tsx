import type { IconName } from "@/assets/icons";
import Icon from "@/components/Icon/Icon";
import type { IncidentType } from "@/types/incidentForm";
import { useId } from "react";

type IncidentTypePickerProps = {
	label: string;
	incidentTypes: IncidentType[];
	value: number[];
	onChange: (ids: number[]) => void;
	error?: string | null;
};

export default function IncidentTypePicker({
	label,
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
			<legend className="sr-only">{label}</legend>
			<div className="grid grid-cols-3 gap-x-3 gap-y-6">
				{incidentTypes.map((type) => {
					const isSelected = value.includes(type.id);

					return (
						<button
							key={type.id}
							type="button"
							aria-pressed={isSelected}
							onClick={() => toggleType(type.id)}
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
								<span className="pt-1 text-sm">
									{type.label}
								</span>
							</div>
						</button>
					);
				})}
			</div>

			{error && (
				<div
					role="alert"
					className="mt-4 flex w-full items-start gap-3 rounded-2xl bg-(--bg-error) px-5 py-3"
				>
					<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error">
						<Icon
							name="exclamation"
							className="h-3.5 w-3.5 fill-white"
							aria-hidden="true"
						/>
					</span>
					<p id={errorId} className="text-sm text-error">
						{error}
					</p>
				</div>
			)}
		</fieldset>
	);
}
