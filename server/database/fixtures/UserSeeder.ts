import argon2 from "argon2";
import AbstractSeeder from "./AbstractSeeder";

// Mot de passe de test pour TOUS les users générés par ce seeder.
// Utilise-le avec le pseudo ou l'email de n'importe lequel des `user_0`..`user_9`.
export const SEED_USER_PASSWORD = "vigie-test-1234";

class UserSeeder extends AbstractSeeder {
	constructor() {
		// Call the constructor of the parent class (AbstractSeeder) with appropriate options
		super({ table: "user", truncate: true });
	}

	// The run method - Populate the 'user' table with fake data

	async run() {
		// Même hash pour tous les users de test : un seul appel Argon2id,
		// mêmes paramètres que le modèle de référence (workshop-js-auth/jwt).
		const passwordHash = await argon2.hash(SEED_USER_PASSWORD, {
			type: argon2.argon2id,
			memoryCost: 19 * 2 ** 10,
			timeCost: 2,
			parallelism: 1,
		});

		// Generate and insert fake data into the 'user' table
		for (let i = 0; i < 10; i += 1) {
			const pseudo =
				`${this.faker.word.adjective()}${this.faker.word.noun()}`
					.charAt(0)
					.toUpperCase() +
				`${this.faker.word.adjective()}${this.faker.word.noun()}`.slice(
					1,
				);
			const email = this.faker.internet.email();

			// Generate fake user data matching the `user` table columns
			const fakeUser = {
				pseudo,
				email,
				pseudo_normalized: pseudo.toLowerCase(),
				email_normalized: email.toLowerCase(),
				password_hash: passwordHash,
				email_verified_at: this.faker.date.past(),
				cgu_version: "1.0",
				cgu_accepted_at: this.faker.date.past(),
				refName: `user_${i}`,
				last_seen_at: null,
			};

			// Insert the fakeUser data into the 'user' table
			this.insert(fakeUser);
		}
	}
}

export default UserSeeder;
