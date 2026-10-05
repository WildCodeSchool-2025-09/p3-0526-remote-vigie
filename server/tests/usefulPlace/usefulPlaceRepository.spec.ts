import databaseClient from "../../database/client";
import usefulPlaceRepository from "../../src/modules/usefulPlace/usefulPlaceRepository";
import type { UsefulPlaceUpsertRow } from "../../src/modules/usefulPlace/usefulPlaceRepository";

afterEach(() => {
	jest.restoreAllMocks();
});

function makeRow(osmId: number): UsefulPlaceUpsertRow {
	return {
		name: `Lieu ${osmId}`,
		category: "pharmacy",
		latitude: 48.85,
		longitude: 2.35,
		streetLine: null,
		city: null,
		phoneNumber: null,
		osmType: "node",
		osmId,
	};
}

describe("usefulPlaceRepository.readAll", () => {
	const bounds = { south: 48.8, north: 48.9, west: 2.2, east: 2.4 };

	it("should filter by position and pass the values in SQL order", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([[]] as never);

		await usefulPlaceRepository.readAll(bounds);

		const [sql, params] = query.mock.calls[0] as unknown as [
			string,
			unknown[],
		];
		expect(sql).toContain(
			"WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
		);
		expect(sql).toContain("ORDER BY id ASC");
		expect(sql).toContain("LIMIT ?");
		// latitude (south, north), longitude (west, east), then the 1000 cap.
		expect(params).toStrictEqual([48.8, 48.9, 2.2, 2.4, 1000]);
	});

	it("should map the columns to camelCase", async () => {
		jest.spyOn(databaseClient, "query").mockResolvedValue([
			[
				{
					id: 7,
					name: "Pharmacie du Centre",
					category: "pharmacy",
					latitude: "48.850000",
					longitude: "2.350000",
					street_line: "1 rue de Paris",
					city: "Paris",
					phone_number: null,
				},
			],
		] as never);

		const places = await usefulPlaceRepository.readAll(bounds);

		expect(places).toStrictEqual([
			{
				id: 7,
				name: "Pharmacie du Centre",
				category: "pharmacy",
				latitude: "48.850000",
				longitude: "2.350000",
				streetLine: "1 rue de Paris",
				city: "Paris",
				phoneNumber: null,
			},
		]);
	});
});

describe("usefulPlaceRepository.upsertMany", () => {
	it("should not query the database for an empty list", async () => {
		const query = jest.spyOn(databaseClient, "query");

		await usefulPlaceRepository.upsertMany([]);

		expect(query).not.toHaveBeenCalled();
	});

	it("should send a single query when the rows fit in one chunk", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([{}] as never);

		await usefulPlaceRepository.upsertMany(
			Array.from({ length: 1000 }, (_, index) => makeRow(index + 1)),
		);

		expect(query).toHaveBeenCalledTimes(1);
	});

	it("should write by chunks of 1000 rows (9 values per row)", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([{}] as never);

		await usefulPlaceRepository.upsertMany(
			Array.from({ length: 2500 }, (_, index) => makeRow(index + 1)),
		);

		const valueCounts = query.mock.calls.map(
			(call) => (call[1] as unknown[]).length,
		);
		expect(valueCounts).toStrictEqual([9000, 9000, 4500]);
	});
});

describe("usefulPlaceRepository.readSyncKeys", () => {
	it("should read only the imported places of the category, with numeric OSM ids", async () => {
		const query = jest.spyOn(databaseClient, "query").mockResolvedValue([
			[
				{ id: 1, osm_type: "node", osm_id: "12281784020" },
				{ id: 2, osm_type: "way", osm_id: 14577452 },
			],
		] as never);

		const keys = await usefulPlaceRepository.readSyncKeys("pharmacy");

		expect(keys).toStrictEqual([
			{ id: 1, osmType: "node", osmId: 12281784020 },
			{ id: 2, osmType: "way", osmId: 14577452 },
		]);
		const [sql, params] = query.mock.calls[0] as unknown as [
			string,
			unknown[],
		];
		expect(sql).toContain("osm_type IS NOT NULL");
		expect(sql).toContain("osm_id IS NOT NULL");
		expect(params).toStrictEqual(["pharmacy"]);
	});
});

describe("usefulPlaceRepository.deleteByIds", () => {
	it("should not query the database for an empty list", async () => {
		const query = jest.spyOn(databaseClient, "query");

		await usefulPlaceRepository.deleteByIds([]);

		expect(query).not.toHaveBeenCalled();
	});

	it("should delete by chunks of 1000 ids", async () => {
		const query = jest
			.spyOn(databaseClient, "query")
			.mockResolvedValue([{}] as never);

		await usefulPlaceRepository.deleteByIds(
			Array.from({ length: 2500 }, (_, index) => index + 1),
		);

		const chunkSizes = query.mock.calls.map(
			(call) => (call[1] as unknown[][])[0].length,
		);
		expect(chunkSizes).toStrictEqual([1000, 1000, 500]);
		expect(query.mock.calls[0][0]).toBe(
			"DELETE FROM useful_place WHERE id IN (?)",
		);
	});
});
