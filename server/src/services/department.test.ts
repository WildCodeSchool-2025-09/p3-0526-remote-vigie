import departmentFromInsee from "./department";

describe("departmentFromInsee", () => {
	test("métropole : les 2 premiers caractères", () => {
		expect(departmentFromInsee("75056")).toBe("75");
	});

	test("conserve le zéro initial", () => {
		expect(departmentFromInsee("01004")).toBe("01");
	});

	test("Corse : 2A / 2B", () => {
		expect(departmentFromInsee("2A004")).toBe("2A"); // Ajaccio
		expect(departmentFromInsee("2B033")).toBe("2B"); // Bastia
	});

	test("outre-mer : les 3 premiers chiffres", () => {
		expect(departmentFromInsee("97105")).toBe("971");
	});
});
