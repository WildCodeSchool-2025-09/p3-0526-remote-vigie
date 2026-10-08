import supertest from "supertest";

import app from "../../src/app";

// Repository et service mockés : on teste la couche HTTP (route → action →
// statut/JSON), sans base de données ni appel à Météo-France.
import addressRepository from "../../src/modules/address/addressRepository";
import vigilanceService from "../../src/services/vigilanceService";
import { authHeader } from "../helpers/authHeader";

const fakeAddress = { inseeCode: "68364", city: "Westhalten" };

afterEach(() => {
	jest.restoreAllMocks();
});

describe("GET /api/weather-vigilance", () => {
	it("should respond 401 without a token", async () => {
		const findAddress = jest
			.spyOn(addressRepository, "findOldestAddress")
			.mockResolvedValue(null);

		const response = await supertest(app).get("/api/weather-vigilance");

		expect(response.status).toBe(401);
		expect(findAddress).not.toHaveBeenCalled();
	});

	it("should respond 204 when the user has no address", async () => {
		const findAddress = jest
			.spyOn(addressRepository, "findOldestAddress")
			.mockResolvedValue(null);

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader(1));

		expect(response.status).toBe(204);
		expect(findAddress).toHaveBeenCalledWith(1);
	});

	it("should respond 204 when the vigilance is green", async () => {
		jest.spyOn(addressRepository, "findOldestAddress").mockResolvedValue(
			fakeAddress,
		);
		jest.spyOn(vigilanceService, "getVigilance").mockResolvedValue(null);

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader());

		expect(response.status).toBe(204);
	});

	it("should respond 200 with the vigilance of the user's department", async () => {
		jest.spyOn(addressRepository, "findOldestAddress").mockResolvedValue(
			fakeAddress,
		);
		const getVigilance = jest
			.spyOn(vigilanceService, "getVigilance")
			.mockResolvedValue({
				level: "orange",
				updatedAt: "2026-10-06T07:30:00Z",
				phenomena: [],
				endTime: null,
			});

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader());

		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual({
			level: "orange",
			department: "68",
			city: "Westhalten",
			updatedAt: "2026-10-06T07:30:00Z",
		});
		expect(getVigilance).toHaveBeenCalledWith("68");
	});

	it("should respond 500 when the database fails", async () => {
		jest.spyOn(addressRepository, "findOldestAddress").mockRejectedValue(
			new Error("DB down"),
		);
		jest.spyOn(console, "error").mockImplementation(() => {});

		const response = await supertest(app)
			.get("/api/weather-vigilance")
			.set(authHeader());

		expect(response.status).toBe(500);
	});
});
