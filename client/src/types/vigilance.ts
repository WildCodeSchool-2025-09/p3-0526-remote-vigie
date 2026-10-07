export type VigilanceLevel = "yellow" | "orange" | "red";

export type WeatherVigilance = {
	level: VigilanceLevel;
	department: string;
	city: string;
	updatedAt: string | null;
};
