import fs from "node:fs";
import path from "node:path";

import {
	KEPT_TABLES,
	PERSONAL_DATA_TABLES,
} from "../../src/modules/users/usersRepository";

// La suppression de compte anonymise la ligne user au lieu de l'effacer : le
// ON DELETE CASCADE ne joue donc jamais, et chaque table rattachée à user doit
// être traitée à la main. Ce test lit schema.sql (sans base de données) et
// échoue si une table liée à user n'est dans aucune des deux listes.
function tablesReferencingUser(): string[] {
	const schema = fs.readFileSync(
		path.join(__dirname, "../../database/schema.sql"),
		"utf8",
	);

	return [...schema.matchAll(/CREATE TABLE `(\w+)` \(([\s\S]*?)\n\) ENGINE/g)]
		.filter(([, table, body]) => {
			return table !== "user" && /REFERENCES `user` \(`id`\)/.test(body);
		})
		.map(([, table]) => table);
}

describe("Account deletion: tables linked to user", () => {
	it("should account for every table that references user", () => {
		const handled = [...PERSONAL_DATA_TABLES, ...KEPT_TABLES].sort();

		expect(tablesReferencingUser().sort()).toStrictEqual(handled);
	});

	it("should not list a table both as deleted and as kept", () => {
		const overlap = PERSONAL_DATA_TABLES.filter((table) =>
			KEPT_TABLES.includes(table),
		);

		expect(overlap).toStrictEqual([]);
	});
});
