import { detailsFromMap, levelFromMap } from "./vigilanceService";

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

const slot = (begin: string, end: string, color: number) => ({
	begin_time: `2026-10-${begin}:00Z`,
	end_time: `2026-10-${end}:00Z`,
	color_id: color,
});

// Cas observés dans de vraies réponses Météo-France (heures en UTC).
const detailedMap = {
	product: {
		periods: [
			{
				echeance: "J",
				timelaps: {
					domain_ids: [
						{
							domain_id: "13",
							phenomenon_items: [
								{
									phenomenon_id: "1",
									phenomenon_max_color_id: 2,
									timelaps_items: [
										slot("08T08:00", "08T16:00", 1),
										slot("08T16:00", "08T22:00", 2),
									],
								},
							],
						},
						{
							domain_id: "30",
							phenomenon_items: [
								{
									phenomenon_id: "4",
									phenomenon_max_color_id: 2,
									timelaps_items: [],
								},
							],
						},
						{
							domain_id: "06",
							phenomenon_items: [
								{
									phenomenon_id: "1",
									phenomenon_max_color_id: 2,
									timelaps_items: [
										slot("08T08:00", "08T12:00", 2),
									],
								},
								{
									phenomenon_id: "3",
									phenomenon_max_color_id: 3,
									timelaps_items: [
										slot("08T08:00", "08T14:00", 3),
									],
								},
							],
						},
						{
							domain_id: "74",
							phenomenon_items: [
								{
									phenomenon_id: "1",
									phenomenon_max_color_id: 2,
									timelaps_items: [
										slot("08T08:00", "08T16:00", 2),
									],
								},
							],
						},
						{
							domain_id: "84",
							phenomenon_items: [
								{
									phenomenon_id: "42",
									phenomenon_max_color_id: 2,
									timelaps_items: [
										slot("08T08:00", "08T16:00", 2),
									],
								},
							],
						},
					],
				},
			},
			{
				echeance: "J1",
				timelaps: {
					domain_ids: [
						{
							domain_id: "13",
							phenomenon_items: [
								{
									phenomenon_id: "1",
									phenomenon_max_color_id: 2,
									timelaps_items: [
										slot("08T22:00", "09T04:00", 2),
										slot("09T04:00", "09T22:00", 1),
									],
								},
							],
						},
						{
							domain_id: "74",
							phenomenon_items: [
								{
									phenomenon_id: "5",
									phenomenon_max_color_id: 2,
									timelaps_items: [
										slot("08T22:00", "09T18:00", 2),
									],
								},
							],
						},
					],
				},
			},
		],
	},
};

describe("detailsFromMap", () => {
	test("vigilance qui continue demain (J1) : fin le lendemain", () => {
		expect(detailsFromMap(detailedMap, "13")).toStrictEqual({
			phenomena: ["wind"],
			endTime: "2026-10-09T04:00:00Z",
		});
	});

	test("crues sans créneau : pas d'heure de fin", () => {
		expect(detailsFromMap(detailedMap, "30")).toStrictEqual({
			phenomena: ["floods"],
			endTime: null,
		});
	});

	test("deux phénomènes : fin = la plus tardive", () => {
		expect(detailsFromMap(detailedMap, "06")).toStrictEqual({
			phenomena: ["wind", "storms"],
			endTime: "2026-10-08T14:00:00Z",
		});
	});

	test("phénomène seulement demain : ignoré (ni phénomène, ni fin)", () => {
		expect(detailsFromMap(detailedMap, "74")).toStrictEqual({
			phenomena: ["wind"],
			endTime: "2026-10-08T16:00:00Z",
		});
	});

	test("identifiant inconnu : ignoré (ni phénomène, ni fin)", () => {
		expect(detailsFromMap(detailedMap, "84")).toStrictEqual({
			phenomena: [],
			endTime: null,
		});
	});

	test("réponse vide ou inattendue", () => {
		const empty = { phenomena: [], endTime: null };
		expect(detailsFromMap(null, "13")).toStrictEqual(empty);
		expect(detailsFromMap({}, "13")).toStrictEqual(empty);
	});
});
