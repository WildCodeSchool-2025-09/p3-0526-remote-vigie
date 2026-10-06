import { levelFromMap } from "./vigilanceService";

// Extrait minimal de la vraie réponse Météo-France.
const map = {
	product: {
		periods: [
			{
				echeance: "J",
				timelaps: {
					domain_ids: [
						{ domain_id: "68", max_color_id: 1 },
						{ domain_id: "2A", max_color_id: 2 },
						{ domain_id: "13", max_color_id: 3 },
						{ domain_id: "06", max_color_id: 4 },
						{ domain_id: "75", max_color_id: 1 },
					],
				},
			},
			{
				echeance: "J1",
				timelaps: {
					domain_ids: [{ domain_id: "75", max_color_id: 4 }],
				},
			},
		],
	},
};

describe("levelFromMap", () => {
	test("vert : pas de bandeau", () => {
		expect(levelFromMap(map, "68")).toBeNull();
	});

	test("jaune, orange, rouge", () => {
		expect(levelFromMap(map, "2A")).toBe("yellow");
		expect(levelFromMap(map, "13")).toBe("orange");
		expect(levelFromMap(map, "06")).toBe("red");
	});

	test("ignore demain (J1) : 75 y est rouge, mais vert aujourd'hui", () => {
		expect(levelFromMap(map, "75")).toBeNull();
	});

	test("département absent (ex. outre-mer) : null", () => {
		expect(levelFromMap(map, "971")).toBeNull();
	});

	test("réponse vide ou inattendue : null", () => {
		expect(levelFromMap(null, "68")).toBeNull();
		expect(levelFromMap({}, "68")).toBeNull();
		expect(levelFromMap({ product: { periods: [] } }, "68")).toBeNull();
	});
});
