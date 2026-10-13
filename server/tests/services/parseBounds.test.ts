import parseBounds from "../../src/services/parseBounds";

const validQuery = {
	north: "51.5",
	south: "41",
	east: "9.8",
	west: "-5.5",
};

describe("parseBounds", () => {
	test("aucune borne fournie : absent", () => {
		expect(parseBounds({})).toStrictEqual({ status: "absent" });
	});

	test("quatre bornes valides : ok, converties en nombres", () => {
		expect(parseBounds(validQuery)).toStrictEqual({
			status: "ok",
			bounds: { north: 51.5, south: 41, east: 9.8, west: -5.5 },
		});
	});

	test("bornes négatives et décimales : ok", () => {
		expect(
			parseBounds({
				north: "-10.25",
				south: "-20.5",
				east: "-30",
				west: "-40.75",
			}),
		).toStrictEqual({
			status: "ok",
			bounds: { north: -10.25, south: -20.5, east: -30, west: -40.75 },
		});
	});

	test.each([
		{ label: "north manquante", missing: "north" },
		{ label: "south manquante", missing: "south" },
		{ label: "east manquante", missing: "east" },
		{ label: "west manquante", missing: "west" },
	])(
		"$label : invalid (pas de repli silencieux sur « sans filtre »)",
		({ missing }) => {
			const query: Record<string, string> = { ...validQuery };
			delete query[missing];

			expect(parseBounds(query)).toStrictEqual({ status: "invalid" });
		},
	);

	test("quatre bornes vides : invalid (Number('') vaut 0, pas un rectangle {0,0,0,0})", () => {
		expect(
			parseBounds({ north: "", south: "", east: "", west: "" }),
		).toStrictEqual({ status: "invalid" });
	});

	test("une borne faite d'espaces : invalid", () => {
		expect(parseBounds({ ...validQuery, north: "   " })).toStrictEqual({
			status: "invalid",
		});
	});

	test.each([
		{ label: "texte", value: "abc" },
		{ label: "NaN", value: "NaN" },
		{ label: "Infinity", value: "Infinity" },
	])("borne non numérique ($label) : invalid", ({ value }) => {
		expect(parseBounds({ ...validQuery, north: value })).toStrictEqual({
			status: "invalid",
		});
	});

	test("borne répétée dans l'URL (tableau) : invalid", () => {
		expect(
			parseBounds({ ...validQuery, north: ["51.5", "52"] }),
		).toStrictEqual({ status: "invalid" });
	});

	test.each([
		{ label: "north au-dessus de 90", override: { north: "91" } },
		{ label: "south en dessous de -90", override: { south: "-91" } },
		{ label: "east au-dessus de 180", override: { east: "181" } },
		{ label: "west en dessous de -180", override: { west: "-181" } },
	])("hors plage ($label) : invalid", ({ override }) => {
		expect(parseBounds({ ...validQuery, ...override })).toStrictEqual({
			status: "invalid",
		});
	});

	test("limites exactes des plages (-90/90, -180/180) : ok", () => {
		expect(
			parseBounds({
				north: "90",
				south: "-90",
				east: "180",
				west: "-180",
			}),
		).toStrictEqual({
			status: "ok",
			bounds: { north: 90, south: -90, east: 180, west: -180 },
		});
	});

	test.each([
		{
			label: "south supérieure à north",
			override: { south: "52", north: "41" },
		},
		{
			label: "south égale à north (zone sans hauteur)",
			override: { south: "45", north: "45" },
		},
		{
			label: "west supérieure à east",
			override: { west: "10", east: "-5" },
		},
		{
			label: "west égale à east (zone sans largeur)",
			override: { west: "2", east: "2" },
		},
	])("bornes incohérentes ($label) : invalid", ({ override }) => {
		expect(parseBounds({ ...validQuery, ...override })).toStrictEqual({
			status: "invalid",
		});
	});
});
