import type { DangerLevel } from "@/components/Form/DangerLevelPicker/DangerLevelPicker";
import type { IncidentType } from "@/types/incidentForm";
import { useEffect, useMemo, useState } from "react";

function getHighestSeverityType(
	incidentTypes: IncidentType[],
	selectedTypes: number[],
): IncidentType | null {
	const selected = incidentTypes.filter((type) =>
		selectedTypes.includes(type.id),
	);

	if (selected.length === 0) return null;

	return selected.reduce((highest, type) =>
		type.danger_level_weight > highest.danger_level_weight ? type : highest,
	);
}

export default function useIncidentTypeSelection(
	incidentTypes: IncidentType[],
) {
	const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
	const [selectionError, setSelectionError] = useState<string | null>(null);
	const [dangerLevel, setDangerLevel] = useState<number | null>(null);
	const [dangerLevelTouched, setDangerLevelTouched] = useState(false);
	const [dangerLevelError, setDangerLevelError] = useState<string | null>(
		null,
	);

	const highestSeverityType = getHighestSeverityType(
		incidentTypes,
		selectedTypes,
	);

	useEffect(() => {
		if (selectedTypes.length === 0) {
			setDangerLevel(null);
			setDangerLevelTouched(false);
			return;
		}

		if (dangerLevelTouched) return;

		setDangerLevel(highestSeverityType?.danger_level_id ?? null);
	}, [selectedTypes, highestSeverityType, dangerLevelTouched]);

	const dangerLevels = useMemo(() => {
		const map = new Map<number, DangerLevel>();

		for (const type of incidentTypes) {
			if (!map.has(type.danger_level_id)) {
				map.set(type.danger_level_id, {
					id: type.danger_level_id,
					weight: type.danger_level_weight,
					label: type.danger_level_label,
					color: type.danger_level_color,
				});
			}
		}

		return [...map.values()].sort((a, b) => a.weight - b.weight);
	}, [incidentTypes]);

	const selectedTypesInstructions = useMemo(
		() =>
			incidentTypes
				.filter((type) => selectedTypes.includes(type.id))
				.map((type) => ({
					code: type.code,
					label: type.label,
					color: type.color,
					safetyInstructions: type.safety_instructions,
				})),
		[incidentTypes, selectedTypes],
	);

	function onSelectedTypesChange(ids: number[]) {
		setSelectedTypes(ids);
		setSelectionError(null);
	}

	function onDangerLevelChange(id: number) {
		setDangerLevel(id);
		setDangerLevelTouched(true);
		setDangerLevelError(null);
	}

	return {
		selectedTypes,
		onSelectedTypesChange,
		selectionError,
		setSelectionError,
		dangerLevel,
		onDangerLevelChange,
		dangerLevelError,
		setDangerLevelError,
		dangerLevels,
		highestSeverityType,
		selectedTypesInstructions,
	};
}
