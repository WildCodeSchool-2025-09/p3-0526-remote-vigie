import supertest from "supertest";

import app from "../../src/app";

// Import the repository whose SQL calls we mock: routes.spec.ts tests the
// HTTP layer (route → action → status/JSON), not the SQL itself.
import incidentRepository from "../../src/modules/incident/incidentRepository";

afterEach(() => {
	jest.restoreAllMocks();
});

// Test suite for the GET /api/incidents route
describe("GET /api/incidents", () => {
	it("should fetch incidents successfully", async () => {
		// Fake incidents returned by the repository, shaped like
		// IncidentRepository#readAllForList's declared return type
		const fakeIncidents = [
			{
				id: 1,
				title: "Incendie rue de la Paix",
				city: "Lyon",
				status: "in_progress" as const,
				createdAt: new Date("2026-09-20T10:00:00.000Z"),
				expiresAt: new Date("2026-09-21T10:00:00.000Z"),
				dangerLevel: { label: "Élevé", color: "#c1392b", weight: 4 },
				type: {
					code: "fire",
					label: "Incendie",
					icon: "fire",
					color: "#c1392b",
				},
			},
		];

		// Mock the repository so no real database call happens
		jest.spyOn(incidentRepository, "readAllForList").mockResolvedValue(
			fakeIncidents,
		);

		// Send a GET request to the /api/incidents endpoint
		const response = await supertest(app).get("/api/incidents");

		// Assertions: status code and response shape (dates become ISO
		// strings once serialized to JSON by Express)
		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual(
			fakeIncidents.map((incident) => ({
				...incident,
				createdAt: incident.createdAt.toISOString(),
				expiresAt: incident.expiresAt.toISOString(),
			})),
		);
	});

	// Boundary value analysis on `limit`: no value (default), just above the
	// cap, and a negative value (regression — Number.parseInt("-5") is
	// truthy, so it used to bypass the default-limit fallback and reach the
	// repository, then MySQL, which rejects a negative LIMIT, unclamped).
	it.each([
		{ query: "", expectedLimit: 15 },
		{ query: "?limit=500", expectedLimit: 100 },
		{ query: "?limit=-5", expectedLimit: 1 },
	])(
		"should resolve GET /api/incidents$query to limit=$expectedLimit",
		async ({ query, expectedLimit }) => {
			const readAllForList = jest
				.spyOn(incidentRepository, "readAllForList")
				.mockResolvedValue([]);

			const response = await supertest(app).get(`/api/incidents${query}`);

			expect(response.status).toBe(200);
			expect(readAllForList).toHaveBeenCalledWith(expectedLimit);
		},
	);
});
