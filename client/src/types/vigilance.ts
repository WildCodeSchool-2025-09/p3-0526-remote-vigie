export type VigilanceLevel = "yellow" | "orange" | "red";

export type Phenomenon =
	| "wind"
	| "rain-flood"
	| "storms"
	| "floods"
	| "snow-ice"
	| "heat-wave"
	| "cold-wave"
	| "avalanches"
	| "waves-submersion";

export type WeatherVigilance = {
	level: VigilanceLevel;
	department: string;
	departmentName: string | null;
	city: string;
	updatedAt: string | null;
	phenomena: Phenomenon[];
	endTime: string | null;
};
