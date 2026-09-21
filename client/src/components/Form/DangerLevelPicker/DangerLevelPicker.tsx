import Icon from "@/components/Icon/Icon";
import { useId } from "react";

export type DangerLevel = {
	id: number;
	weight: number;
	label: string;
	color: string;
};

type DangerLevelPickerProps = {
	label: string;
	dangerLevels: DangerLevel[];
	value: number | null;
	onChange: (dangerLevelId: number) => void;
	error?: string | null;
};

export default function DangerLevelPicker({
	label,
	dangerLevels,
	value,
	onChange,
	error,
}: DangerLevelPickerProps) {
	const errorId = useId();

	function selectLevel(id: number) {
		onChange(id);
	}

	return (
		<fieldset
			aria-describedby={error ? errorId : undefined}
			className="min-w-0"
		>
			<legend className="font-bold text-primary pb-2">{label}</legend>
			<div className="flex min-w-0 gap-2">
				{dangerLevels.map((level) => {
					const isSelected = value === level.id;
					const levelColor = `var(--level-${level.weight})`;

					return (
						<button
							key={level.id}
							type="button"
							aria-pressed={isSelected}
							onClick={() => selectLevel(level.id)}
							className="min-w-0 flex-1"
						>
							<div
								className={`flex aspect-square flex-col items-center justify-center rounded-2xl border-2 p-1 transition-transform ${
									isSelected ? "scale-110" : ""
								}`}
								style={{
									borderColor: isSelected
										? levelColor
										: "var(--grey)",
									backgroundColor: isSelected
										? `var(--bg-level-${level.weight})`
										: "transparent",
								}}
							>
								<span
									className="text-base font-bold"
									style={{ color: levelColor }}
								>
									{level.weight}
								</span>
								<span
									className="text-[10px] leading-tight"
									style={{
										color: isSelected
											? levelColor
											: "var(--primary-dark)",
									}}
								>
									{level.label}
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
