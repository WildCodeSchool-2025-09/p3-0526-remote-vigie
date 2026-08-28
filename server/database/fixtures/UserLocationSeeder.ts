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
            const fakeLocation = {
                user_id: this.getRef(`user_${i}`).insertId,
                is_enabled: i % 4 !== 0 ? 1 : 0,
                latitude: 49.09 + i * 0.001,
                longitude: 1.48 + i * 0.001,
            };

            // Insert the fakeLocation data into the 'user_location' table
            this.insert(fakeLocation);
        }
    }
}

export default UserLocationSeeder;
