export type EmergencyNumber = {
	name: string;
	number: string;
	description: string;
	action: "call" | "sms";
};

export type EmergencyCategory = {
	title: string;
	numbers: EmergencyNumber[];
};
