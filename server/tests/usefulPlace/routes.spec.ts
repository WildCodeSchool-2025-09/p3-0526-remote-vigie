import supertest from "supertest";

import app from "../../src/app";

// Import the repository whose SQL calls we mock: routes.spec.ts tests the
// HTTP layer (route → action → status/JSON), not the SQL itself.
import usefulPlaceRepository from "../../src/modules/usefulPlace/usefulPlaceRepository";

afterEach(() => {
	jest.restoreAllMocks();
});

const PARIS_BOUNDS = "north=48.87&south=48.84&east=2.37&west=2.32";

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

		const response = await supertest(app).get(
			`/api/useful-places?${PARIS_BOUNDS}`,
		);

		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual(fakeUsefulPlaces);
		expect(readAll).toHaveBeenCalledTimes(1);
	});

	it("should parse north/south/east/west into bounds", async () => {
		const readAll = jest
			.spyOn(usefulPlaceRepository, "readAll")
			.mockResolvedValue([]);

		const response = await supertest(app).get(
			"/api/useful-places?north=47.3&south=47.2&east=-1.5&west=-1.6",
		);

		expect(response.status).toBe(200);
		expect(readAll).toHaveBeenCalledWith({
			north: 47.3,
			south: 47.2,
			east: -1.5,
			west: -1.6,
		});
	});

	it.each([
		{ label: "no bounds at all", query: "" },
		{
			label: "empty bounds",
			query: "?north=&south=&east=&west=",
		},
		{
			label: "incomplete bounds (east missing)",
			query: "?north=48.87&south=48.84&west=2.32",
		},
		{
			label: "an unreadable bound",
			query: "?north=abc&south=48.84&east=2.37&west=2.32",
		},
		{
			label: "a latitude out of range",
			query: "?north=91&south=48.84&east=2.37&west=2.32",
		},
		{
			label: "inverted latitudes (south above north)",
			query: "?north=48.84&south=48.87&east=2.37&west=2.32",
		},
		{
			label: "a zone of about 10 degrees (the whole of France)",
			query: "?north=51.5&south=41&east=9.8&west=-5.5",
		},
	])(
		"should reject $label with 400 and never query the database",
		async ({ query }) => {
			const readAll = jest
				.spyOn(usefulPlaceRepository, "readAll")
				.mockResolvedValue([]);

			const response = await supertest(app).get(
				`/api/useful-places${query}`,
			);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe("invalid_bounds");
			expect(readAll).not.toHaveBeenCalled();
		},
	);

	// Valeurs limites de la taille de zone : 1 degré exactement accepté,
	// juste au-dessus refusé.
	it.each([
		{
			label: "exactly 1 degree wide and high",
			query: "?north=49&south=48&east=3&west=2",
			expectedStatus: 200,
		},
		{
			label: "just above 1 degree high",
			query: "?north=49.01&south=48&east=3&west=2",
			expectedStatus: 400,
		},
		{
			label: "just above 1 degree wide",
			query: "?north=49&south=48&east=3.01&west=2",
			expectedStatus: 400,
		},
	])(
		"should answer $expectedStatus for a zone $label",
		async ({ query, expectedStatus }) => {
			jest.spyOn(usefulPlaceRepository, "readAll").mockResolvedValue([]);

			const response = await supertest(app).get(
				`/api/useful-places${query}`,
			);

			expect(response.status).toBe(expectedStatus);
		},
	);
});
