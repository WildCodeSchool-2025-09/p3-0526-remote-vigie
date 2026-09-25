import supertest from "supertest";

import app from "../../src/app";

// Import the repository whose SQL calls we mock: routes.spec.ts tests the
// HTTP layer (route → action → status/JSON), not the SQL itself.
import usefulPlaceRepository from "../../src/modules/usefulPlace/usefulPlaceRepository";

afterEach(() => {
	jest.restoreAllMocks();
});

describe("GET /api/useful-places", () => {
	it("should fetch useful places successfully", async () => {
		const fakeUsefulPlaces = [
			{
				id: 1,
				name: "Pharmacie du Centre",
				category: "pharmacy" as const,
				latitude: "45.75",
				longitude: "4.85",
				streetLine: "3 rue de la République",
				city: "Lyon",
				phoneNumber: "0478000000",
			},
		];

		const readAll = jest
			.spyOn(usefulPlaceRepository, "readAll")
			.mockResolvedValue(fakeUsefulPlaces);

		const response = await supertest(app).get("/api/useful-places");

		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual(fakeUsefulPlaces);
		expect(readAll).toHaveBeenCalledWith(null);
	});

	it("should parse north/south/east/west into bounds", async () => {
		const readAll = jest
			.spyOn(usefulPlaceRepository, "readAll")
			.mockResolvedValue([]);

		const response = await supertest(app).get(
			"/api/useful-places?north=51.5&south=41&east=9.8&west=-5.5",
		);

		expect(response.status).toBe(200);
		expect(readAll).toHaveBeenCalledWith({
			north: 51.5,
			south: 41,
			east: 9.8,
			west: -5.5,
		});
	});

	it("should ignore incomplete bounds and fall back to no zone filter", async () => {
		const readAll = jest
			.spyOn(usefulPlaceRepository, "readAll")
			.mockResolvedValue([]);

		// Missing "west": parseBounds must treat this as no filter at all,
		// not as a partial/broken one.
		const response = await supertest(app).get(
			"/api/useful-places?north=51.5&south=41&east=9.8",
		);

		expect(response.status).toBe(200);
		expect(readAll).toHaveBeenCalledWith(null);
	});
});
