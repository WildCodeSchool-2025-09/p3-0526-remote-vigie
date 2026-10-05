import databaseClient from "../../database/client";
import incidentRepository from "../../src/modules/incident/incidentRepository";

afterEach(() => {
	jest.restoreAllMocks();
});

const bounds = { south: 48.8, north: 48.9, west: 2.2, east: 2.4 };

// The route tests mock the repository: these tests mock the database instead,
// to check the SQL and the parameters the repository builds.
describe("incidentRepository.readAllForList", () => {
	it("should not filter by position without bounds", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		const incidents = await incidentRepository.readAllForList(15);

		expect(incidents).toStrictEqual([]);
		expect(query).toHaveBeenCalledTimes(1);
		const [sql, params] = query.mock.calls[0] as unknown as [
			string,
			unknown[],
		];
		expect(sql).not.toContain("BETWEEN");
		expect(params).toStrictEqual([15]);
	});

	it("should filter by position and pass the values in SQL order with bounds", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(300, bounds);

		const [sql, params] = query.mock.calls[0] as unknown as [
			string,
			unknown[],
		];
		expect(sql).toContain(
			"WHERE i.latitude BETWEEN ? AND ? AND i.longitude BETWEEN ? AND ?",
		);
		expect(sql).toContain("LIMIT ?");
		// latitude (south, north), longitude (west, east), then the limit.
		expect(params).toStrictEqual([48.8, 48.9, 2.2, 2.4, 300]);
	});

	it("should skip the types query when no incident is in the zone", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(300, bounds);

		expect(query).toHaveBeenCalledTimes(1);
	});

	it("should keep the most serious type of each incident as its type", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValueOnce([
				[
					{
						id: 2,
						title: "Feu à Paris",
						city: "Paris",
						latitude: "48.850000",
						longitude: "2.350000",
						status: "in_progress",
						created_at: new Date("2026-10-05T10:00:00Z"),
						expires_at: new Date("2026-10-06T10:00:00Z"),
						danger_level_label: "Élevé",
						danger_level_color: "#ff0000",
						danger_level_weight: 3,
					},
					{
						id: 1,
						title: "Sans type",
						city: null,
						latitude: "48.860000",
						longitude: "2.360000",
						status: "in_progress",
						created_at: new Date("2026-10-04T10:00:00Z"),
						expires_at: new Date("2026-10-05T10:00:00Z"),
						danger_level_label: "Faible",
						danger_level_color: "#00ff00",
						danger_level_weight: 1,
					},
				],
			] as never)
			.mockResolvedValueOnce([
				[
					// Already sorted by the query: the most serious type comes first.
					{
						incident_id: 2,
						code: "fire",
						label: "Feu",
						icon: "fire.svg",
						color: "#ff0000",
					},
					{
						incident_id: 2,
						code: "smoke",
						label: "Fumée",
						icon: "smoke.svg",
						color: "#999999",
					},
				],
			] as never);

		const incidents = await incidentRepository.readAllForList(300, bounds);

		expect(query.mock.calls[1][1]).toStrictEqual([[2, 1]]);
		expect(incidents.map((incident) => incident.id)).toStrictEqual([2, 1]);
		expect(incidents[0].type).toStrictEqual({
			code: "fire",
			label: "Feu",
			icon: "fire.svg",
			color: "#ff0000",
		});
		expect(incidents[0].dangerLevel).toStrictEqual({
			label: "Élevé",
			color: "#ff0000",
			weight: 3,
		});
		expect(incidents[1].type).toBeNull();
	});
});
