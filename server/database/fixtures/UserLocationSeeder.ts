import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class UserLocationSeeder extends AbstractSeeder {
    constructor() {
        // Call the constructor of the parent class (AbstractSeeder) with appropriate options
        super({ table: "user_location", truncate: true, dependencies: [UserSeeder] });
    }

    // The run method - Populate the 'user_location' table with fake data

    run() {
        // Generate and insert fake data into the 'user_location' table
        for (let i = 0; i < 10; i += 1) {


            // Generate fake location data matching the `user_location` table columns
            const fakeIncident = {

                password_hash: this.faker.string.alphanumeric(60),

            };

            // Insert the fakeLocation data into the 'user_location' table
            this.insert(fakeIncident);
        }
    }
}

export default UserLocationSeeder;
