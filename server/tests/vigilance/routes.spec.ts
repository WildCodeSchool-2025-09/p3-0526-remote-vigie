import supertest from "supertest";

import app from "../../src/app";

// Repository et service mockés : on teste la couche HTTP (route → action →
// statut/JSON), sans base de données ni appel à Météo-France.
import addressRepository from "../../src/modules/address/addressRepository";
import vigilanceService from "../../src/services/vigilanceService";
import { authHeader } from "../helpers/authHeader";

afterEach(() => {
	jest.restoreAllMocks();
});

describe("GET /api/weather-vigilance", () => {
	it("should respond 401 without a token", async () => {
		const findInseeCode = jest
			.spyOn(addressRepository, "findOldestInseeCode")
			.mockResolvedValue(null);

		const response = await supertest(app).get("/api/weather-vigilance");

		expect(response.status).toBe(401);
		expect(findInseeCode).not.toHaveBeenCalled();
	});

	it("should respond 204 when the user has no address", async () => {
		const findInseeCode = jest
			.spyOn(addressRepository, "findOldestInseeCode")
			.mockResolvedValue(null);

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader(1));

		expect(response.status).toBe(204);
		expect(findInseeCode).toHaveBeenCalledWith(1);
	});

	it("should respond 204 when the vigilance is green", async () => {
		jest.spyOn(addressRepository, "findOldestInseeCode").mockResolvedValue(
			"68364",
		);
		jest.spyOn(vigilanceService, "getVigilanceLevel").mockResolvedValue(
			null,
		);

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader());

		expect(response.status).toBe(204);
	});

	it("should respond 200 with the level of the user's department", async () => {
		jest.spyOn(addressRepository, "findOldestInseeCode").mockResolvedValue(
			"68364",
		);
		const getLevel = jest
			.spyOn(vigilanceService, "getVigilanceLevel")
			.mockResolvedValue("orange");

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader());

		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual({ level: "orange" });
		expect(getLevel).toHaveBeenCalledWith("68");
	});

	it("should respond 500 when the database fails", async () => {
		jest.spyOn(addressRepository, "findOldestInseeCode").mockRejectedValue(
			new Error("DB down"),
		);
		jest.spyOn(console, "error").mockImplementation(() => {});

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader());

		expect(response.status).toBe(500);
	});
});
