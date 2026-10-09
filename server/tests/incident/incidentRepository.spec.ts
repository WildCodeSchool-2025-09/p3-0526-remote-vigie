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

		const page = await incidentRepository.readAllForList(15);

		expect(page).toStrictEqual({ incidents: [], truncated: false });
		expect(query).toHaveBeenCalledTimes(1);
		const [sql, params] = query.mock.calls[0] as unknown as [
			string,
			unknown[],
		];
		expect(sql).not.toContain("BETWEEN");
		// One more row than the limit is requested, to detect a truncation.
		expect(params).toStrictEqual([16]);
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
			"i.latitude BETWEEN ? AND ? AND i.longitude BETWEEN ? AND ?",
		);
		expect(sql).toContain("LIMIT ?");
		// latitude (south, north), longitude (west, east), then the limit + 1.
		expect(params).toStrictEqual([48.8, 48.9, 2.2, 2.4, 301]);
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

		const { incidents } = await incidentRepository.readAllForList(
			300,
			bounds,
		);

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

	it("should not flag a truncation when exactly `limit` rows come back", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValueOnce([[incidentRow(2), incidentRow(1)]] as never)
			.mockResolvedValueOnce([[]] as never);

		const page = await incidentRepository.readAllForList(2);

		expect(page.truncated).toBe(false);
		expect(page.incidents.map((incident) => incident.id)).toStrictEqual([
			2, 1,
		]);
		expect(query.mock.calls[0][1]).toStrictEqual([3]);
	});

	it("should flag a truncation and drop the extra row when `limit` + 1 rows come back", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValueOnce([
				[incidentRow(3), incidentRow(2), incidentRow(1)],
			] as never)
			.mockResolvedValueOnce([[]] as never);

		const page = await incidentRepository.readAllForList(2);

		expect(page.truncated).toBe(true);
		expect(page.incidents.map((incident) => incident.id)).toStrictEqual([
			3, 2,
		]);
		// The extra row must not reach the types query.
		expect(query.mock.calls[1][1]).toStrictEqual([[3, 2]]);
	});
});

// A row as returned by the main query of readAllForList.
function incidentRow(id: number) {
	return {
		id,
		title: `Incident ${id}`,
		city: "Paris",
		latitude: "48.850000",
		longitude: "2.350000",
		status: "in_progress",
		created_at: new Date("2026-10-05T10:00:00Z"),
		expires_at: new Date("2026-10-06T10:00:00Z"),
		danger_level_label: "Faible",
		danger_level_color: "#00ff00",
		danger_level_weight: 1,
	};
}

// First query sent by readAllForList: the SQL text and its parameters.
function mainQuery(query: jest.SpyInstance) {
	return query.mock.calls[0] as unknown as [string, unknown[]];
}

describe("incidentRepository.readAllForList filters", () => {
	const ongoing = "i.status = 'in_progress' AND i.expires_at > NOW()";

	it("should keep only ongoing, not expired incidents by default", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(15);

		const [sql, params] = mainQuery(query);
		expect(sql).toContain(`WHERE ${ongoing}`);
		expect(params).toStrictEqual([16]);
	});

	it("should drop the status and expiry condition with includeResolved", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(15, null, {
			includeResolved: true,
			sort: "date",
			search: null,
		});

		const [sql, params] = mainQuery(query);
		expect(sql).not.toContain("WHERE");
		expect(sql).not.toContain("expires_at >");
		expect(params).toStrictEqual([16]);
	});

	it.each([
		{
			sort: "date" as const,
			orderBy: "ORDER BY i.created_at DESC, i.id DESC",
		},
		{
			sort: "date_asc" as const,
			orderBy: "ORDER BY i.created_at ASC, i.id ASC",
		},
		{
			sort: "severity" as const,
			orderBy: "ORDER BY d.weight DESC, i.created_at DESC, i.id DESC",
		},
		{
			sort: "severity_asc" as const,
			orderBy: "ORDER BY d.weight ASC, i.created_at DESC, i.id DESC",
		},
	])("should order by $sort", async ({ sort, orderBy }) => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(15, null, {
			includeResolved: false,
			sort,
			search: null,
		});

		expect(mainQuery(query)[0]).toContain(orderBy);
	});

	it("should search title, description, city and type labels with four identical parameters", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(100, null, {
			includeResolved: false,
			sort: "date",
			search: "feu",
		});

		const [sql, params] = mainQuery(query);
		expect(sql).toContain("i.title LIKE ?");
		expect(sql).toContain("i.description LIKE ?");
		expect(sql).toContain("i.city LIKE ?");
		expect(sql).toContain("st.label LIKE ?");
		// Types are matched with EXISTS: no join, so no duplicated incident.
		expect(sql).toContain("EXISTS");
		// The text itself never reaches the SQL, only its parameters.
		expect(sql).not.toContain("feu");
		expect(params).toStrictEqual(["%feu%", "%feu%", "%feu%", "%feu%", 101]);
	});

	it("should escape the LIKE wildcards and the escape character of the search", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(100, null, {
			includeResolved: false,
			sort: "date",
			search: "50%_a\\b",
		});

		// 50%_a\b becomes 50\%\_a\\b: each special character is prefixed by `\`.
		const pattern = "%50\\%\\_a\\\\b%";
		expect(mainQuery(query)[1]).toStrictEqual([
			pattern,
			pattern,
			pattern,
			pattern,
			101,
		]);
	});

	it("should pass bounds, then search values, then the limit, in SQL order", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(300, bounds, {
			includeResolved: true,
			sort: "severity",
			search: "x",
		});

		const [sql, params] = mainQuery(query);
		expect(sql.indexOf("BETWEEN")).toBeLessThan(sql.indexOf("LIKE"));
		expect(params).toStrictEqual([
			48.8,
			48.9,
			2.2,
			2.4,
			"%x%",
			"%x%",
			"%x%",
			"%x%",
			301,
		]);
	});

	it("should combine every condition with AND", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await incidentRepository.readAllForList(300, bounds, {
			includeResolved: false,
			sort: "date",
			search: "x",
		});

		const [sql] = mainQuery(query);
		expect(sql).toContain(
			`WHERE ${ongoing} AND i.latitude BETWEEN ? AND ? AND i.longitude BETWEEN ? AND ? AND (i.title LIKE ?`,
		);
	});
});
