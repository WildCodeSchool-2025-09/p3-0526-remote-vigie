import supertest from "supertest";

import databaseClient from "../../database/client";
import app from "../../src/app";

// On mocke les dépôts et services : ce fichier teste la couche HTTP
// (route → action → statut/JSON), pas le SQL.
import incidentRepository from "../../src/modules/incident/incidentRepository";
import incidentTypeRepository from "../../src/modules/incidentType/incidentTypeRepository";
import alertService from "../../src/services/alertService";
import geocodingService from "../../src/services/geocodingService";
import { authHeader } from "../helpers/authHeader";

afterEach(() => {
	jest.restoreAllMocks();
});

// Type « danger » tel que le renvoie incidentTypeRepository.readByCode().
const fakeDangerType = {
	id: 2,
	code: "danger",
	label: "Personne en danger",
	alert_radius_meters: 1000,
	lifespan_hours: 4,
	safety_instructions: null,
	icon: "danger",
	color: "#C1392B",
	danger_level_id: 5,
	danger_level_weight: 5,
	danger_level_label: "Critique",
	danger_level_color: "#C1392B",
};

const validBody = { latitude: 48.85, longitude: 2.35 };

describe("POST /api/incidents/danger", () => {
	it("should respond 401 without an authentication token", async () => {
		const response = await supertest(app)
			.post("/api/incidents/danger")
			.send(validBody);

		expect(response.status).toBe(401);
	});

	it.each([
		{ label: "no body", body: {} },
		{
			label: "latitude out of bounds",
			body: { latitude: 200, longitude: 2 },
		},
		{
			label: "longitude out of bounds",
			body: { latitude: 48, longitude: -181 },
		},
		{
			label: "non-numeric latitude",
			body: { latitude: "abc", longitude: 2 },
		},
	])("should respond 400 with $label", async ({ body }) => {
		jest.spyOn(incidentRepository, "countRecentByUser").mockResolvedValue(
			0,
		);
		jest.spyOn(incidentTypeRepository, "readByCode").mockResolvedValue(
			fakeDangerType,
		);
		const create = jest.spyOn(incidentRepository, "create");

		const response = await supertest(app)
			.post("/api/incidents/danger")
			.set(authHeader())
			.send(body);

		expect(response.status).toBe(400);
		expect(response.body.error).toBe("invalid_position");
		expect(create).not.toHaveBeenCalled();
	});

	it("should respond 500 when the danger type is missing from the database", async () => {
		jest.spyOn(incidentRepository, "countRecentByUser").mockResolvedValue(
			0,
		);
		jest.spyOn(incidentTypeRepository, "readByCode").mockResolvedValue(
			null,
		);

		const response = await supertest(app)
			.post("/api/incidents/danger")
			.set(authHeader())
			.send(validBody);

		expect(response.status).toBe(500);
	});

	it("should respond 409 when the same user just sent a danger alert nearby", async () => {
		jest.spyOn(incidentRepository, "countRecentByUser").mockResolvedValue(
			0,
		);
		jest.spyOn(incidentTypeRepository, "readByCode").mockResolvedValue(
			fakeDangerType,
		);
		jest.spyOn(geocodingService, "reverse").mockResolvedValue({
			streetLine: null,
			city: "Paris",
			postalCode: "75001",
			inseeCode: "75101",
		});
		jest.spyOn(incidentRepository, "readRecentByUser").mockResolvedValue([
			{
				id: 10,
				typeIds: [fakeDangerType.id],
				latitude: "48.85",
				longitude: "2.35",
				baseAlertRadiusMeters: 1000,
				city: "Paris",
				createdAt: new Date(),
			},
		]);
		const create = jest.spyOn(incidentRepository, "create");

		const response = await supertest(app)
			.post("/api/incidents/danger")
			.set(authHeader())
			.send(validBody);

		expect(response.status).toBe(409);
		expect(create).not.toHaveBeenCalled();
	});

	it("should create the alert from the danger type only, without requiring a verified e-mail", async () => {
		const fakeIncident = {
			id: 42,
			title: "Personne en danger à Paris",
			description: null,
			photoUrl: null,
			latitude: "48.85",
			longitude: "2.35",
			city: "Paris",
			postalCode: "75001",
			inseeCode: "75101",
			status: "in_progress" as const,
			createdAt: new Date("2026-10-05T10:00:00.000Z"),
			editedAt: null,
			expiresAt: new Date("2026-10-05T14:00:00.000Z"),
			dangerLevel: { label: "Critique", color: "#C1392B", weight: 5 },
			author: { id: 1, pseudo: "test" },
			types: [
				{
					code: "danger",
					label: "Personne en danger",
					icon: "danger",
					color: "#C1392B",
					safetyInstructions: null,
				},
			],
			counts: { confirm: 0, deny: 0 },
			myContribution: null,
		};

		// requireVerifiedEmail interroge la base directement : si la route
		// l'appliquait par erreur, cet espion serait appelé.
		const databaseQuery = jest.spyOn(databaseClient, "query");
		jest.spyOn(incidentRepository, "countRecentByUser").mockResolvedValue(
			0,
		);
		jest.spyOn(incidentTypeRepository, "readByCode").mockResolvedValue(
			fakeDangerType,
		);
		jest.spyOn(geocodingService, "reverse").mockResolvedValue({
			streetLine: null,
			city: "Paris",
			postalCode: "75001",
			inseeCode: "75101",
		});
		jest.spyOn(incidentRepository, "readRecentByUser").mockResolvedValue(
			[],
		);
		const create = jest
			.spyOn(incidentRepository, "create")
			.mockResolvedValue(42);
		jest.spyOn(incidentRepository, "read").mockResolvedValue(fakeIncident);
		const dispatch = jest
			.spyOn(alertService, "dispatch")
			.mockResolvedValue(undefined);

		// Le client tente d'imposer un type, une gravité et un titre : le
		// serveur doit les ignorer.
		const response = await supertest(app)
			.post("/api/incidents/danger")
			.set(authHeader())
			.send({
				...validBody,
				typeIds: [99],
				dangerLevelId: 1,
				title: "Titre imposé",
			});

		expect(response.status).toBe(201);
		expect(databaseQuery).not.toHaveBeenCalled();
		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				typeIds: [fakeDangerType.id],
				dangerLevelId: fakeDangerType.danger_level_id,
				alertRadiusMeters: fakeDangerType.alert_radius_meters,
				lifespanHours: fakeDangerType.lifespan_hours,
				title: "Personne en danger à Paris",
			}),
		);
		expect(dispatch).toHaveBeenCalledWith(
			expect.objectContaining({ isDanger: true }),
		);
	});
});
