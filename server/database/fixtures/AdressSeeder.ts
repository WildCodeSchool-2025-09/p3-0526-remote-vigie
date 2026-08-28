import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class AddressSeeder extends AbstractSeeder {
    constructor() {
        // Call the constructor of the parent class (AbstractSeeder) with appropriate options
        super({ table: "address", truncate: true, dependencies: [UserSeeder] });
    }

    // The run method - Populate the 'address' table with fake data

    run() {
        // Generate and insert fake data into the 'address' table
        for (let i = 0; i < 10; i += 1) {


            // Generate fake address data matching the `address` table columns
            const fakeIncident = {

                password_hash: this.faker.string.alphanumeric(60),

            };

            // Insert the fakeAddress data into the 'address' table
            this.insert(fakeIncident);
        }
    }
}

export default AddressSeeder;
