import AbstractSeeder from "./AbstractSeeder";

class UserSeeder extends AbstractSeeder {
  constructor() {
    // Call the constructor of the parent class (AbstractSeeder) with appropriate options
    super({ table: "users", truncate: true });
  }

  // The run method - Populate the 'users' table with fake data

  run() {
    // Generate and insert fake data into the 'users' table
    for (let i = 0; i < 10; i += 1) {
      const pseudo =
        `${this.faker.word.adjective()}${this.faker.word.noun()}`
          .charAt(0)
          .toUpperCase() +
        `${this.faker.word.adjective()}${this.faker.word.noun()}`.slice(1);
      const email = this.faker.internet.email();

      // Generate fake user data matching the `users` table columns
      const fakeUser = {
        pseudo,
        email,
        pseudo_normalized: pseudo.toLowerCase(),
        email_normalized: email.toLowerCase(),
        // password_hash must be 60 chars (bcrypt format) to match CHAR(60)
        password_hash: this.faker.string.alphanumeric(60),
        email_verified_at: this.faker.date.past(),
        cgu_version: "1.0",
        cgu_accepted_at: this.faker.date.past(),
        refName: `user_${i}`,
      };

      // Insert the fakeUser data into the 'users' table
      this.insert(fakeUser);
    }
  }
}

// Export the UserSeeder class
export default UserSeeder;
