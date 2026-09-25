type PasswordStrengthMeterProps = {
	score: number;
	label: string;
};

// Inverse des niveaux de gravité des incidents (theme.css) : --level-1 (vert,
// "faible" danger) devient le meilleur score, --level-5 (rouge, "critique")
// le pire — d'où l'ordre décroissant ici.
const SEGMENT_LEVELS = [5, 4, 2, 1];

export default function PasswordStrengthMeter({
	score,
	label,
}: PasswordStrengthMeterProps) {
	return (
		<div className="flex items-center gap-2">
			<div className="flex flex-1 gap-1">
				{SEGMENT_LEVELS.map((level, index) => (
					<div
						key={level}
						className="h-1.5 flex-1 rounded-full bg-primary/10"
						style={
							index < score
								? { backgroundColor: `var(--level-${level})` }
								: undefined
						}
					/>
				))}
			</div>
			<span className="text-xs font-bold text-primary">{label}</span>
		</div>
	);
}
