import usefulPlaceRepository from "../../src/modules/usefulPlace/usefulPlaceRepository";
import type { UsefulPlaceUpsertRow } from "../../src/modules/usefulPlace/usefulPlaceRepository";
import usefulPlaceSyncService from "../../src/services/usefulPlaceSyncService";

afterEach(() => {
	jest.restoreAllMocks();
});

describe("usefulPlaceSyncService.transformElement", () => {
	it("should transform a complete node into a full row", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 251652819,
				lat: 48.8527413,
				lon: 2.3333559,
				tags: {
					name: "CityPharma",
					phone: "+33 1 46 33 06 09",
					"addr:housenumber": "26",
					"addr:street": "Rue du Four",
					"addr:city": "Paris",
				},
			},
			"pharmacy",
		);

		expect(row).toStrictEqual({
			name: "CityPharma",
			category: "pharmacy",
			latitude: 48.8527413,
			longitude: 2.3333559,
			streetLine: "26 Rue du Four",
			city: "Paris",
			phoneNumber: "+33 1 46 33 06 09",
			osmType: "node",
			osmId: 251652819,
		});
	});

	it("should read coordinates from center on a way, and accept a missing address", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "way",
				id: 14577452,
				center: { lat: 48.8663639, lon: 2.4020047 },
				tags: {
					name: "Hôpital Tenon",
					phone: "+33 1 56 01 70 00",
				},
			},
			"hospital",
		);

		expect(row).toStrictEqual({
			name: "Hôpital Tenon",
			category: "hospital",
			latitude: 48.8663639,
			longitude: 2.4020047,
			streetLine: null,
			city: null,
			phoneNumber: "+33 1 56 01 70 00",
			osmType: "way",
			osmId: 14577452,
		});
	});

	it("should fall back to operator when name is missing", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 12281784020,
				lat: 48.85,
				lon: 2.35,
				tags: {
					amenity: "police",
					operator: "Gendarmerie nationale",
				},
			},
			"police",
		);

		expect(row?.name).toBe("Gendarmerie nationale");
	});

	it("should ignore a closed place even if it has an old_name", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 2217376339,
				lat: 48.86,
				lon: 2.34,
				tags: {
					amenity: "veterinary",
					office: "vacant",
					old_name: "Cabinet Vétérinaire Docteur Gosselet",
				},
			},
			"veterinary",
		);

		expect(row).toBeNull();
	});

	it("should ignore a place with neither name nor operator", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 1931492456,
				lat: 48.87,
				lon: 2.33,
				tags: { amenity: "veterinary" },
			},
			"veterinary",
		);

		expect(row).toBeNull();
	});

	it("should fall back to contact:* fields when addr:* is absent", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 900000001,
				lat: 48.87,
				lon: 2.36,
				tags: {
					name: "Clinique Vétérinaire du Faubourg",
					"contact:housenumber": "248",
					"contact:street": "Rue du Faubourg Saint-Martin",
					"contact:city": "Paris",
				},
			},
			"veterinary",
		);

		expect(row?.streetLine).toBe("248 Rue du Faubourg Saint-Martin");
		expect(row?.city).toBe("Paris");
	});

	it("should log a warning but still import a place with a fixme tag", () => {
		const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 900000002,
				lat: 48.85,
				lon: 2.35,
				tags: {
					name: "Commissariat du 10e",
					fixme: "Préciser le type de police",
				},
			},
			"police",
		);

		expect(row).not.toBeNull();
		expect(warn).toHaveBeenCalledTimes(1);
	});

	it("should keep only the first phone number when several are separated by ;", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 900000003,
				lat: 48.85,
				lon: 2.35,
				tags: {
					name: "Pharmacie du Faubourg",
					phone: "111-AAA;222-BBB",
				},
			},
			"pharmacy",
		);

		expect(row?.phoneNumber).toBe("111-AAA");
	});

	it("should truncate a phone number longer than 20 characters", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 900000004,
				lat: 48.85,
				lon: 2.35,
				tags: {
					name: "Pharmacie du Faubourg",
					phone: "1234567890123456789012345",
				},
			},
			"pharmacy",
		);

		expect(row?.phoneNumber).toBe("12345678901234567890");
		expect(row?.phoneNumber).toHaveLength(20);
	});

	it.each([
		{
			field: "name",
			max: 150,
			read: (row: UsefulPlaceUpsertRow | null) => row?.name,
		},
		{
			field: "street line",
			max: 255,
			read: (row: UsefulPlaceUpsertRow | null) => row?.streetLine,
		},
		{
			field: "city",
			max: 100,
			read: (row: UsefulPlaceUpsertRow | null) => row?.city,
		},
	])(
		"should keep a $field of $max characters and truncate a longer one",
		({ field, max, read }) => {
			const transformWith = (length: number) => {
				const text = "x".repeat(length);
				return usefulPlaceSyncService.transformElement(
					{
						type: "node",
						id: 900000010,
						lat: 48.85,
						lon: 2.35,
						tags: {
							name:
								field === "name"
									? text
									: "Pharmacie du Faubourg",
							"addr:street":
								field === "street line" ? text : "Rue du Four",
							"addr:city": field === "city" ? text : "Paris",
						},
					},
					"pharmacy",
				);
			};

			expect(read(transformWith(max))).toBe("x".repeat(max));
			expect(read(transformWith(max + 1))).toBe("x".repeat(max));
			expect(read(transformWith(max + 500))).toBe("x".repeat(max));
		},
	);

	it("should truncate the whole street line, house number included", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 900000011,
				lat: 48.85,
				lon: 2.35,
				tags: {
					name: "Pharmacie du Faubourg",
					"addr:housenumber": "12",
					"addr:street": "x".repeat(300),
				},
			},
			"pharmacy",
		);

		expect(row?.streetLine).toHaveLength(255);
		expect(row?.streetLine?.startsWith("12 x")).toBe(true);
	});

	it("should not cut an emoji in two when truncating", () => {
		const row = usefulPlaceSyncService.transformElement(
			{
				type: "node",
				id: 900000012,
				lat: 48.85,
				lon: 2.35,
				tags: { name: `${"a".repeat(149)}😀😀` },
			},
			"pharmacy",
		);

		expect(row?.name).toBe(`${"a".repeat(149)}😀`);
		expect(Array.from(row?.name ?? "")).toHaveLength(150);
	});
});

describe("usefulPlaceSyncService.buildQuery", () => {
	it("should target metropolitan France and the requested category's OSM tag", () => {
		const query = usefulPlaceSyncService.buildQuery("pharmacy");

		expect(query).toContain('area["ISO3166-1"="FR"][admin_level=2]');
		expect(query).toContain('nwr["amenity"="pharmacy"]');
		expect(query).toContain("(41,-5.5,51.5,9.8)");
		expect(query).toContain("out center tags;");
	});

	it("should use a different tag value for each category", () => {
		const police = usefulPlaceSyncService.buildQuery("police");
		const veterinary = usefulPlaceSyncService.buildQuery("veterinary");

		expect(police).toContain('nwr["amenity"="police"]');
		expect(veterinary).toContain('nwr["amenity"="veterinary"]');
	});
});

describe("usefulPlaceSyncService.fetchElements", () => {
	it("should return the elements on a successful response", async () => {
		const fakeElements = [{ type: "node", id: 1, lat: 48.85, lon: 2.35 }];
		const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ elements: fakeElements }),
		} as Response);

		const elements = await usefulPlaceSyncService.fetchElements("pharmacy");

		expect(elements).toStrictEqual(fakeElements);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	it("should retry once after a failed attempt and succeed on the second try", async () => {
		jest.useFakeTimers();

		const fakeElements = [
			{ type: "way", id: 2, center: { lat: 48.9, lon: 2.4 } },
		];
		const fetchSpy = jest
			.spyOn(global, "fetch")
			.mockResolvedValueOnce({ ok: false, status: 504 } as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ elements: fakeElements }),
			} as Response);
		const errorSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const resultPromise = usefulPlaceSyncService.fetchElements("hospital");
		await jest.advanceTimersByTimeAsync(5000);
		const elements = await resultPromise;

		expect(elements).toStrictEqual(fakeElements);
		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(errorSpy).toHaveBeenCalledTimes(1);

		jest.useRealTimers();
	});

	it("should give up and throw after every attempt fails", async () => {
		jest.useFakeTimers();

		const fetchSpy = jest
			.spyOn(global, "fetch")
			.mockRejectedValue(new Error("network error"));
		jest.spyOn(console, "error").mockImplementation(() => {});

		const resultPromise =
			usefulPlaceSyncService.fetchElements("veterinary");
		const assertion = expect(resultPromise).rejects.toThrow(
			'Overpass : échec pour "veterinary" après 2 tentatives (network error)',
		);
		await jest.advanceTimersByTimeAsync(5000);
		await assertion;

		expect(fetchSpy).toHaveBeenCalledTimes(2);

		jest.useRealTimers();
	});

	it("should treat a partial answer (Overpass remark) as a failure", async () => {
		jest.useFakeTimers();

		const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					elements: [{ type: "node", id: 1, lat: 48.85, lon: 2.35 }],
					remark: "runtime error: Query timed out",
				}),
		} as Response);
		jest.spyOn(console, "error").mockImplementation(() => {});

		const resultPromise = usefulPlaceSyncService.fetchElements("hospital");
		const assertion = expect(resultPromise).rejects.toThrow(
			"Réponse partielle d'Overpass",
		);
		await jest.advanceTimersByTimeAsync(5000);
		await assertion;

		expect(fetchSpy).toHaveBeenCalledTimes(2);

		jest.useRealTimers();
	});

	it("should treat an empty answer as a failure", async () => {
		jest.useFakeTimers();

		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ elements: [] }),
		} as Response);
		jest.spyOn(console, "error").mockImplementation(() => {});

		const resultPromise = usefulPlaceSyncService.fetchElements("pharmacy");
		const assertion = expect(resultPromise).rejects.toThrow(
			"Aucun élément renvoyé",
		);
		await jest.advanceTimersByTimeAsync(5000);
		await assertion;

		jest.useRealTimers();
	});
});

function overpassResponse(elements: unknown[]): Response {
	return {
		ok: true,
		json: () => Promise.resolve({ elements }),
	} as Response;
}

function oneNode(id: number) {
	return {
		type: "node",
		id,
		lat: 48.85,
		lon: 2.35,
		tags: { name: `Lieu ${id}` },
	};
}

describe("usefulPlaceSyncService.run", () => {
	it("should fetch, transform and upsert every category, pausing between each", async () => {
		jest.useFakeTimers();
		jest.spyOn(console, "info").mockImplementation(() => {});

		const fetchSpy = jest
			.spyOn(global, "fetch")
			.mockResolvedValue(overpassResponse([oneNode(1)]));
		const upsertSpy = jest
			.spyOn(usefulPlaceRepository, "upsertMany")
			.mockResolvedValue();
		jest.spyOn(usefulPlaceRepository, "readSyncKeys").mockResolvedValue([]);
		const deleteSpy = jest
			.spyOn(usefulPlaceRepository, "deleteByIds")
			.mockResolvedValue();

		const runPromise = usefulPlaceSyncService.run();
		// 4 pauses de 2 s entre les 5 catégories.
		await jest.advanceTimersByTimeAsync(4 * 2000);
		await runPromise;

		expect(fetchSpy).toHaveBeenCalledTimes(5);
		expect(upsertSpy).toHaveBeenCalledTimes(5);
		expect(upsertSpy).toHaveBeenCalledWith([
			expect.objectContaining({ name: "Lieu 1", osmId: 1 }),
		]);
		expect(deleteSpy).not.toHaveBeenCalled();

		jest.useRealTimers();
	});

	it("should keep going when a category fails, then throw an error naming it", async () => {
		jest.useFakeTimers();
		jest.spyOn(console, "info").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		jest.spyOn(global, "fetch").mockImplementation(async (_url, init) => {
			if (String(init?.body).includes('"amenity"="fire_station"')) {
				throw new Error("network error");
			}
			return overpassResponse([oneNode(1)]);
		});
		const upsertSpy = jest
			.spyOn(usefulPlaceRepository, "upsertMany")
			.mockResolvedValue();
		jest.spyOn(usefulPlaceRepository, "readSyncKeys").mockResolvedValue([]);

		const runPromise = usefulPlaceSyncService.run();
		const assertion = expect(runPromise).rejects.toThrow(
			"catégories en échec : fire_station",
		);
		// 1 pause de réessai (5 s) + 4 pauses entre catégories (2 s).
		await jest.advanceTimersByTimeAsync(5000 + 4 * 2000 + 1000);
		await assertion;

		expect(upsertSpy).toHaveBeenCalledTimes(4);

		jest.useRealTimers();
	});

	it("should remove the places that Overpass no longer returns", async () => {
		jest.useFakeTimers();
		jest.spyOn(console, "info").mockImplementation(() => {});

		jest.spyOn(global, "fetch").mockResolvedValue(
			overpassResponse([oneNode(1), oneNode(2), oneNode(3)]),
		);
		jest.spyOn(usefulPlaceRepository, "upsertMany").mockResolvedValue();
		jest.spyOn(usefulPlaceRepository, "readSyncKeys")
			.mockResolvedValueOnce([
				{ id: 10, osmType: "node", osmId: 1 },
				{ id: 11, osmType: "node", osmId: 2 },
				{ id: 12, osmType: "node", osmId: 3 },
				{ id: 13, osmType: "node", osmId: 999 },
			])
			.mockResolvedValue([]);
		const deleteSpy = jest
			.spyOn(usefulPlaceRepository, "deleteByIds")
			.mockResolvedValue();

		const runPromise = usefulPlaceSyncService.run();
		await jest.advanceTimersByTimeAsync(4 * 2000);
		await runPromise;

		expect(deleteSpy).toHaveBeenCalledTimes(1);
		expect(deleteSpy).toHaveBeenCalledWith([13]);

		jest.useRealTimers();
	});

	it("should refuse to remove more than half of a category and report it as failed", async () => {
		jest.useFakeTimers();
		jest.spyOn(console, "info").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		jest.spyOn(global, "fetch").mockResolvedValue(
			overpassResponse([oneNode(1)]),
		);
		jest.spyOn(usefulPlaceRepository, "upsertMany").mockResolvedValue();
		jest.spyOn(usefulPlaceRepository, "readSyncKeys")
			.mockResolvedValueOnce([
				{ id: 10, osmType: "node", osmId: 1 },
				{ id: 11, osmType: "node", osmId: 2 },
				{ id: 12, osmType: "node", osmId: 3 },
				{ id: 13, osmType: "node", osmId: 4 },
			])
			.mockResolvedValue([]);
		const deleteSpy = jest
			.spyOn(usefulPlaceRepository, "deleteByIds")
			.mockResolvedValue();

		const runPromise = usefulPlaceSyncService.run();
		const assertion = expect(runPromise).rejects.toThrow(
			"catégories en échec : fire_station",
		);
		await jest.advanceTimersByTimeAsync(4 * 2000);
		await assertion;

		expect(deleteSpy).not.toHaveBeenCalled();

		jest.useRealTimers();
	});
});

describe("usefulPlaceSyncService.parseCategories", () => {
	it("should return every category when no argument is given", () => {
		expect(usefulPlaceSyncService.parseCategories([])).toStrictEqual([
			"fire_station",
			"veterinary",
			"hospital",
			"pharmacy",
			"police",
		]);
	});

	it("should return only the requested categories, once each and in the usual order", () => {
		expect(
			usefulPlaceSyncService.parseCategories([
				"veterinary",
				"fire_station",
				"veterinary",
			]),
		).toStrictEqual(["fire_station", "veterinary"]);
	});

	it("should reject an unknown category and list the valid ones", () => {
		expect(() =>
			usefulPlaceSyncService.parseCategories(["fire_station", "bakery"]),
		).toThrow(
			"Catégorie inconnue : bakery. Valeurs possibles : fire_station, veterinary, hospital, pharmacy, police",
		);
	});
});

describe("usefulPlaceSyncService.run with a subset of categories", () => {
	it("should only synchronise the requested categories, without a pause after the last one", async () => {
		jest.useFakeTimers();
		jest.spyOn(console, "info").mockImplementation(() => {});

		const fetchSpy = jest
			.spyOn(global, "fetch")
			.mockResolvedValue(overpassResponse([oneNode(1)]));
		const upsertSpy = jest
			.spyOn(usefulPlaceRepository, "upsertMany")
			.mockResolvedValue();
		jest.spyOn(usefulPlaceRepository, "readSyncKeys").mockResolvedValue([]);

		const runPromise = usefulPlaceSyncService.run(["veterinary", "police"]);
		// 1 seule pause de 2 s, entre les 2 catégories.
		await jest.advanceTimersByTimeAsync(2000);
		await runPromise;

		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(upsertSpy).toHaveBeenCalledTimes(2);
		const queries = fetchSpy.mock.calls.map((call) =>
			String(call[1]?.body),
		);
		expect(queries[0]).toContain('"amenity"="veterinary"');
		expect(queries[1]).toContain('"amenity"="police"');

		jest.useRealTimers();
	});

	it("should name the failed categories and the command to retry them", async () => {
		jest.useFakeTimers();
		jest.spyOn(console, "info").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});

		jest.spyOn(global, "fetch").mockRejectedValue(
			new Error("network error"),
		);

		const runPromise = usefulPlaceSyncService.run(["veterinary"]);
		const assertion = expect(runPromise).rejects.toThrow(
			"Pour les relancer : npm run sync:places -- veterinary",
		);
		await jest.advanceTimersByTimeAsync(5000 + 1000);
		await assertion;

		jest.useRealTimers();
	});
});
