import departmentName, { DEPARTMENT_NAMES } from "./departmentNames";

describe("departmentName", () => {
	test("métropole, avec le zéro initial", () => {
		expect(departmentName("30")).toBe("Gard");
		expect(departmentName("01")).toBe("Ain");
	});

	test("Corse et outre-mer", () => {
		expect(departmentName("2A")).toBe("Corse-du-Sud");
		expect(departmentName("2B")).toBe("Haute-Corse");
		expect(departmentName("974")).toBe("La Réunion");
	});

	test("code inconnu : null", () => {
		expect(departmentName("99")).toBeNull();
		expect(departmentName("toString")).toBeNull(); // clé héritée d'Object
	});

	test("la liste contient les 101 départements", () => {
		expect(Object.keys(DEPARTMENT_NAMES)).toHaveLength(101);
	});
});
