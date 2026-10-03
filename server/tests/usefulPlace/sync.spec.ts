import usefulPlaceRepository from "../../src/modules/usefulPlace/usefulPlaceRepository";
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
		const warnSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const resultPromise = usefulPlaceSyncService.fetchElements("hospital");
		await jest.advanceTimersByTimeAsync(5000);
		const elements = await resultPromise;

		expect(elements).toStrictEqual(fakeElements);
		expect(fetchSpy).toHaveBeenCalledTimes(2);
		expect(warnSpy).toHaveBeenCalledTimes(1);

		jest.useRealTimers();
	});

	it("should give up and return an empty array after every attempt fails", async () => {
		jest.useFakeTimers();

		const fetchSpy = jest
			.spyOn(global, "fetch")
			.mockRejectedValue(new Error("network error"));
		jest.spyOn(console, "error").mockImplementation(() => {});

		const resultPromise =
			usefulPlaceSyncService.fetchElements("veterinary");
		await jest.advanceTimersByTimeAsync(5000);
		const elements = await resultPromise;

		expect(elements).toStrictEqual([]);
		expect(fetchSpy).toHaveBeenCalledTimes(2);

		jest.useRealTimers();
	});
});

describe("usefulPlaceSyncService.run", () => {
	it("should fetch, transform and upsert every category, pausing between each", async () => {
		jest.useFakeTimers();

		const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					elements: [
						{
							type: "node",
							id: 1,
							lat: 48.85,
							lon: 2.35,
							tags: { name: "Test" },
						},
					],
				}),
		} as Response);
		const upsertSpy = jest
			.spyOn(usefulPlaceRepository, "upsertMany")
			.mockResolvedValue();

		const runPromise = usefulPlaceSyncService.run();
		// 4 pauses de 2 s entre les 5 catégories.
		await jest.advanceTimersByTimeAsync(4 * 2000);
		await runPromise;

		expect(fetchSpy).toHaveBeenCalledTimes(5);
		expect(upsertSpy).toHaveBeenCalledTimes(5);
		expect(upsertSpy).toHaveBeenCalledWith([
			expect.objectContaining({ name: "Test", osmId: 1 }),
		]);

		jest.useRealTimers();
	});
});
