import parseListFilters, {
	MAX_SEARCH_LENGTH,
} from "../../src/services/parseListFilters";

describe("parseListFilters", () => {
	test("aucun paramètre : valeurs par défaut", () => {
		expect(parseListFilters({})).toStrictEqual({
			status: "ok",
			filters: { includeResolved: false, sort: "date", search: null },
		});
	});

	test.each([
		{ value: "date", expected: "date" },
		{ value: "date_asc", expected: "date_asc" },
		{ value: "severity", expected: "severity" },
		{ value: "severity_asc", expected: "severity_asc" },
		{ value: "asc", expected: "date" },
		{ value: "gravité", expected: "date" },
		{ value: "DATE", expected: "date" },
		{ value: "created_at; DROP TABLE incident", expected: "date" },
		{ value: ["severity"], expected: "date" },
		{ value: undefined, expected: "date" },
	])("sort=$value : tri $expected", ({ value, expected }) => {
		expect(parseListFilters({ sort: value })).toStrictEqual({
			status: "ok",
			filters: { includeResolved: false, sort: expected, search: null },
		});
	});

	test.each([
		{ value: "true", expected: true },
		{ value: "false", expected: false },
		{ value: "1", expected: false },
		{ value: "TRUE", expected: false },
		{ value: "", expected: false },
		{ value: ["true"], expected: false },
	])("includeResolved=$value : $expected", ({ value, expected }) => {
		const result = parseListFilters({ includeResolved: value });

		expect(result).toStrictEqual({
			status: "ok",
			filters: { includeResolved: expected, sort: "date", search: null },
		});
	});

	test("search : espaces retirés aux extrémités", () => {
		expect(parseListFilters({ search: "  feu  " })).toStrictEqual({
			status: "ok",
			filters: { includeResolved: false, sort: "date", search: "feu" },
		});
	});

	test.each([{ value: "" }, { value: "   " }])(
		"search vide ou blanche ($value) : aucune recherche",
		({ value }) => {
			expect(parseListFilters({ search: value })).toStrictEqual({
				status: "ok",
				filters: { includeResolved: false, sort: "date", search: null },
			});
		},
	);

	test("search à la longueur maximale exacte : ok", () => {
		const search = "a".repeat(MAX_SEARCH_LENGTH);

		expect(parseListFilters({ search })).toStrictEqual({
			status: "ok",
			filters: { includeResolved: false, sort: "date", search },
		});
	});

	test("search un caractère au-dessus de la longueur maximale : invalid", () => {
		const search = "a".repeat(MAX_SEARCH_LENGTH + 1);

		expect(parseListFilters({ search })).toStrictEqual({
			status: "invalid",
		});
	});

	test("search trop longue seulement à cause des espaces : ok", () => {
		const search = ` ${"a".repeat(MAX_SEARCH_LENGTH)} `;

		expect(parseListFilters({ search }).status).toBe("ok");
	});

	test.each([
		{ label: "répétée (tableau)", value: ["a", "b"] },
		{ label: "objet", value: { $ne: "" } },
		{ label: "nombre", value: 12 },
	])("search $label : invalid", ({ value }) => {
		expect(parseListFilters({ search: value })).toStrictEqual({
			status: "invalid",
		});
	});

	test("les trois paramètres se combinent", () => {
		expect(
			parseListFilters({
				search: "incendie",
				sort: "severity",
				includeResolved: "true",
			}),
		).toStrictEqual({
			status: "ok",
			filters: {
				includeResolved: true,
				sort: "severity",
				search: "incendie",
			},
		});
	});
});
