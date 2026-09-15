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
									color: isSelected
										? "var(--accent-light)"
										: levelColor,
									borderColor: levelColor,
									backgroundColor: isSelected
										? `var(--level-${level.weight})`
										: "transparent",
								}}
							>
								<span className="text-base font-bold">
									{level.weight}
								</span>
								<span className="text-[10px] leading-tight">
									{level.label}
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
