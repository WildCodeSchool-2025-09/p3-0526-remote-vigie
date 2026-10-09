import supertest from "supertest";

import databaseClient from "../../database/client";
import app from "../../src/app";

// Import the repository whose SQL calls we mock: routes.spec.ts tests the
// HTTP layer (route → action → status/JSON), not the SQL itself.
import userBadgeRepository from "../../src/modules/badge/userBadgeRepository";
import incidentRepository from "../../src/modules/incident/incidentRepository";
import incidentTypeRepository from "../../src/modules/incidentType/incidentTypeRepository";
import alertService from "../../src/services/alertService";
import geocodingService from "../../src/services/geocodingService";
import { authHeader } from "../helpers/authHeader";

afterEach(() => {
	jest.restoreAllMocks();
});

// Filters applied when the query carries none.
const defaultFilters = {
	includeResolved: false,
	sort: "date",
	search: null,
};

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
				latitude: "45.75",
				longitude: "4.85",
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
		jest.spyOn(incidentRepository, "readAllForList").mockResolvedValue({
			incidents: fakeIncidents,
			truncated: false,
		});

		// Send a GET request to the /api/incidents endpoint
		const response = await supertest(app).get("/api/incidents");

		// Assertions: status code and response shape (dates become ISO
		// strings once serialized to JSON by Express)
		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual({
			incidents: fakeIncidents.map((incident) => ({
				...incident,
				createdAt: incident.createdAt.toISOString(),
				expiresAt: incident.expiresAt.toISOString(),
			})),
			truncated: false,
		});
	});

	it("should forward the truncated flag from the repository", async () => {
		jest.spyOn(incidentRepository, "readAllForList").mockResolvedValue({
			incidents: [],
			truncated: true,
		});

		const response = await supertest(app).get("/api/incidents");

		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual({ incidents: [], truncated: true });
	});

	// Valeurs limites de `limit` : absent, au-dessus du plafond, négatif.
	it.each([
		{ query: "", expectedLimit: 15 },
		{ query: "?limit=500", expectedLimit: 100 },
		{ query: "?limit=-5", expectedLimit: 1 },
	])(
		"should resolve GET /api/incidents$query to limit=$expectedLimit",
		async ({ query, expectedLimit }) => {
			const readAllForList = jest
				.spyOn(incidentRepository, "readAllForList")
				.mockResolvedValue({ incidents: [], truncated: false });

			const response = await supertest(app).get(`/api/incidents${query}`);

			expect(response.status).toBe(200);
			expect(readAllForList).toHaveBeenCalledWith(
				expectedLimit,
				null,
				defaultFilters,
			);
		},
	);

	it("should parse north/south/east/west into bounds and raise the limit cap to 300", async () => {
		const readAllForList = jest
			.spyOn(incidentRepository, "readAllForList")
			.mockResolvedValue({ incidents: [], truncated: false });

		const response = await supertest(app).get(
			"/api/incidents?limit=500&north=51.5&south=41&east=9.8&west=-5.5",
		);

		expect(response.status).toBe(200);
		expect(readAllForList).toHaveBeenCalledWith(
			300,
			{
				north: 51.5,
				south: 41,
				east: 9.8,
				west: -5.5,
			},
			defaultFilters,
		);
	});

	// Sans recherche : filtre « en cours » et tri par date. Une valeur de tri
	// inconnue retombe sur la date au lieu de produire une erreur.
	it.each([
		{
			query: "?includeResolved=true",
			filters: { includeResolved: true, sort: "date", search: null },
		},
		{
			query: "?sort=severity",
			filters: { includeResolved: false, sort: "severity", search: null },
		},
		{
			query: "?sort=date_asc",
			filters: { includeResolved: false, sort: "date_asc", search: null },
		},
		{
			query: "?sort=severity_asc",
			filters: {
				includeResolved: false,
				sort: "severity_asc",
				search: null,
			},
		},
		{
			query: "?sort=nonsense",
			filters: { includeResolved: false, sort: "date", search: null },
		},
		{
			query: "?search=%20feu%20&sort=severity&includeResolved=true",
			filters: { includeResolved: true, sort: "severity", search: "feu" },
		},
	])(
		"should pass the filters of GET /api/incidents$query",
		async ({ query, filters }) => {
			const readAllForList = jest
				.spyOn(incidentRepository, "readAllForList")
				.mockResolvedValue({ incidents: [], truncated: false });

			const response = await supertest(app).get(`/api/incidents${query}`);

			expect(response.status).toBe(200);
			expect(readAllForList.mock.calls[0][2]).toStrictEqual(filters);
		},
	);

	// Avec une recherche ou les résolus inclus, la page par défaut (15) laisse la
	// place au plafond (100).
	it.each([
		{ query: "?search=feu", expectedLimit: 100 },
		{ query: "?search=feu&limit=20", expectedLimit: 20 },
		{ query: "?search=feu&limit=500", expectedLimit: 100 },
		{ query: "?search=%20%20", expectedLimit: 15 },
		{ query: "?includeResolved=true", expectedLimit: 100 },
		{ query: "?includeResolved=true&limit=20", expectedLimit: 20 },
		{ query: "?includeResolved=true&limit=500", expectedLimit: 100 },
		{ query: "?includeResolved=false", expectedLimit: 15 },
	])(
		"should resolve GET /api/incidents$query to limit=$expectedLimit",
		async ({ query, expectedLimit }) => {
			const readAllForList = jest
				.spyOn(incidentRepository, "readAllForList")
				.mockResolvedValue({ incidents: [], truncated: false });

			const response = await supertest(app).get(`/api/incidents${query}`);

			expect(response.status).toBe(200);
			expect(readAllForList.mock.calls[0][0]).toBe(expectedLimit);
		},
	);

	it.each([
		{ label: "too long", query: `?search=${"a".repeat(101)}` },
		{ label: "repeated", query: "?search=a&search=b" },
	])(
		"should reject a $label search with 400 and never query the database",
		async ({ query }) => {
			const readAllForList = jest
				.spyOn(incidentRepository, "readAllForList")
				.mockResolvedValue({ incidents: [], truncated: false });

			const response = await supertest(app).get(`/api/incidents${query}`);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe("invalid_search");
			expect(readAllForList).not.toHaveBeenCalled();
		},
	);

	// Bornes facultatives, mais refusées si elles sont fournies et fausses :
	// jamais de repli silencieux sur « pas de filtre ».
	it.each([
		{
			label: "empty bounds",
			query: "?north=&south=&east=&west=",
		},
		{
			label: "incomplete bounds (west missing)",
			query: "?north=51.5&south=41&east=9.8",
		},
		{
			label: "an unreadable bound",
			query: "?north=abc&south=41&east=9.8&west=-5.5",
		},
		{
			label: "inverted longitudes (west above east)",
			query: "?north=51.5&south=41&east=-5.5&west=9.8",
		},
	])(
		"should reject $label with 400 and never query the database",
		async ({ query }) => {
			const readAllForList = jest
				.spyOn(incidentRepository, "readAllForList")
				.mockResolvedValue({ incidents: [], truncated: false });

			const response = await supertest(app).get(`/api/incidents${query}`);

			expect(response.status).toBe(400);
			expect(response.body.error).toBe("invalid_bounds");
			expect(readAllForList).not.toHaveBeenCalled();
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
		const response = await supertest(app)
			.post("/api/incidents")
			.set(authHeader())
			.send({});

		expect(response.status).toBe(400);
	});

	// Mocks every dependency incidentActions.add goes through; returns the
	// alert dispatch spy.
	function mockIncidentCreation() {
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
		jest.spyOn(userBadgeRepository, "readRecentByUser").mockResolvedValue(
			[],
		);
		// Fire-and-forget after the response: mocked so no real e-mail is sent.
		return jest
			.spyOn(alertService, "dispatch")
			.mockResolvedValue(undefined);
	}

	function postValidIncident() {
		return supertest(app)
			.post("/api/incidents")
			.set(authHeader())
			.send({
				typeIds: [1],
				latitude: 45.75,
				longitude: 4.85,
				dangerLevelId: 4,
			});
	}

	it("should create an incident and respond 201 with a valid body", async () => {
		mockIncidentCreation();

		const response = await postValidIncident();

		expect(response.status).toBe(201);
		expect(response.body.author.badges).toStrictEqual([]);
	});

	it("should still respond 201 and dispatch the alert when reading the badges fails", async () => {
		const dispatch = mockIncidentCreation();
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(userBadgeRepository, "readRecentByUser").mockRejectedValue(
			new Error("db down"),
		);

		const response = await postValidIncident();

		expect(response.status).toBe(201);
		expect(response.body.author.badges).toStrictEqual([]);
		expect(dispatch).toHaveBeenCalledTimes(1);
	});
});

describe("PUT /api/incidents/:id", () => {
	it("should include the author badges in the response", async () => {
		const fakeBadge = {
			code: "jungle",
			label: "Livre de la jungle",
			description: "5 signalements Animal sauvage",
			icon: "01-livre-de-la-jungle.png",
			earnedAt: new Date("2026-09-24T10:00:00.000Z"),
		};

		const fakeIncident = {
			id: 42,
			title: "Incendie modifié",
			description: null,
			photoUrl: null,
			latitude: "45.75",
			longitude: "4.85",
			city: "Lyon",
			postalCode: "69000",
			inseeCode: "69123",
			status: "in_progress" as const,
			createdAt: new Date("2026-09-24T10:00:00.000Z"),
			editedAt: new Date("2026-09-24T11:00:00.000Z"),
			expiresAt: new Date("2026-09-25T10:00:00.000Z"),
			dangerLevel: { label: "Élevé", color: "#c1392b", weight: 4 },
			author: { id: 1, pseudo: "test" },
			types: [],
			counts: { confirm: 0, deny: 0 },
			myContribution: null,
		};

		// requireIncidentAuthor lets the author (user 1) through
		jest.spyOn(incidentRepository, "findOwnerAndStatus").mockResolvedValue({
			userId: 1,
			status: "in_progress",
			city: "Lyon",
		});
		jest.spyOn(incidentRepository, "update").mockResolvedValue(undefined);
		jest.spyOn(incidentRepository, "read").mockResolvedValue(fakeIncident);
		jest.spyOn(userBadgeRepository, "readRecentByUser").mockResolvedValue([
			fakeBadge,
		]);

		const response = await supertest(app)
			.put("/api/incidents/42")
			.set(authHeader())
			.send({ title: "Incendie modifié" });

		expect(response.status).toBe(200);
		expect(response.body.author.badges).toStrictEqual([
			{ ...fakeBadge, earnedAt: fakeBadge.earnedAt.toISOString() },
		]);
	});
});
