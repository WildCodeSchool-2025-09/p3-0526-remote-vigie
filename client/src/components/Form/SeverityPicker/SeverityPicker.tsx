import { useId } from "react";

export type DangerLevel = {
	id: number;
	weight: number;
	label: string;
	color: string;
};

type SeverityPickerProps = {
	dangerLevels: DangerLevel[];
	value: number | null;
	onChange: (dangerLevelId: number) => void;
	error?: string | null;
};

export default function SeverityPicker({
	dangerLevels,
	value,
	onChange,
	error,
}: SeverityPickerProps) {
	const errorId = useId();

	function selectLevel(id: number) {
		onChange(id);
	}

	return (
		<fieldset
			aria-describedby={error ? errorId : undefined}
			className="min-w-0"
		>
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
								className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 p-1 transition-transform ${
									isSelected ? "scale-110" : ""
								}`}
								style={{
									borderColor: levelColor,
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
									style={{ color: levelColor }}
								>
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
