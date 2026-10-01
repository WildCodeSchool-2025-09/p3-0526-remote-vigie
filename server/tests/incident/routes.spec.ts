import supertest from "supertest";

import databaseClient from "../../database/client";
import app from "../../src/app";

// Import the repository whose SQL calls we mock: routes.spec.ts tests the
// HTTP layer (route → action → status/JSON), not the SQL itself.
import incidentRepository from "../../src/modules/incident/incidentRepository";
import incidentTypeRepository from "../../src/modules/incidentType/incidentTypeRepository";
import alertService from "../../src/services/alertService";
import geocodingService from "../../src/services/geocodingService";

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

// Test suite for the POST /api/incidents route
describe("POST /api/incidents", () => {
	it("should reject an invalid body with 400", async () => {
		// Let the two middlewares in front of incidentActions.add through:
		// requireVerifiedEmail queries the DB directly (no repository to spy
		// on), checkIncidentRateLimit goes through incidentRepository.
		jest.spyOn(databaseClient, "query").mockResolvedValue([
			[{ email_verified_at: new Date() }],
		] as never);
		jest.spyOn(incidentRepository, "countRecentByUser").mockResolvedValue(
			0,
		);

		// Empty body: typeIds is missing, incidentActions.add rejects it
		// before touching anything else.
		const response = await supertest(app).post("/api/incidents").send({});

		expect(response.status).toBe(400);
	});

	it("should create an incident and respond 201 with a valid body", async () => {
		// Fake incident type returned by incidentTypeRepository.readAll(),
		// shaped like IncidentType. Its id/dangerLevelId must match the body.
		const fakeType = {
			id: 1,
			code: "fire",
			label: "Incendie",
			alert_radius_meters: 500,
			lifespan_hours: 24,
			safety_instructions: null,
			icon: "fire",
			color: "#c1392b",
			danger_level_id: 4,
			danger_level_weight: 4,
			danger_level_label: "Élevé",
			danger_level_color: "#c1392b",
		};

		// Fake incident returned by incidentRepository.read() once created,
		// shaped like IncidentDetails — this is what the route responds with.
		const fakeIncident = {
			id: 42,
			title: "Incendie à Lyon",
			description: null,
			photoUrl: null,
			latitude: "45.75",
			longitude: "4.85",
			city: "Lyon",
			postalCode: "69000",
			inseeCode: "69123",
			status: "in_progress" as const,
			createdAt: new Date("2026-09-24T10:00:00.000Z"),
			editedAt: null,
			expiresAt: new Date("2026-09-25T10:00:00.000Z"),
			dangerLevel: { label: "Élevé", color: "#c1392b", weight: 4 },
			author: { id: 1, pseudo: "test" },
			types: [
				{
					code: "fire",
					label: "Incendie",
					icon: "fire",
					color: "#c1392b",
					safetyInstructions: null,
				},
			],
			counts: { confirm: 0, deny: 0 },
			myContribution: null,
		};

		// One mock per dependency incidentActions.add calls along the way,
		// in the same order they appear in the code.
		jest.spyOn(databaseClient, "query").mockResolvedValue([
			[{ email_verified_at: new Date() }],
		] as never);
		jest.spyOn(incidentRepository, "countRecentByUser").mockResolvedValue(
			0,
		);
		jest.spyOn(incidentTypeRepository, "readAll").mockResolvedValue([
			fakeType,
		]);
		jest.spyOn(geocodingService, "reverse").mockResolvedValue({
			streetLine: null,
			city: "Lyon",
			postalCode: "69000",
			inseeCode: "69123",
		});
		jest.spyOn(incidentRepository, "readRecentByUser").mockResolvedValue(
			[],
		);
		jest.spyOn(incidentRepository, "create").mockResolvedValue(42);
		jest.spyOn(incidentRepository, "read").mockResolvedValue(fakeIncident);
		// Fire-and-forget after the response: mocked so no real e-mail is sent.
		jest.spyOn(alertService, "dispatch").mockResolvedValue(undefined);

		const response = await supertest(app)
			.post("/api/incidents")
			.send({
				typeIds: [1],
				latitude: 45.75,
				longitude: 4.85,
				dangerLevelId: 4,
			});

		expect(response.status).toBe(201);
	});
});
