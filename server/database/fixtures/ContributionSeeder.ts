import AbstractSeeder from "./AbstractSeeder";
import IncidentSeeder from "./IncidentSeeder";
import UserSeeder from "./UserSeeder";

class ContributionSeeder extends AbstractSeeder {
    constructor() {
        // Call the constructor of the parent class (AbstractSeeder) with appropriate options
        super({ table: "contribution", truncate: true, dependencies: [IncidentSeeder, UserSeeder] });
    }

    // The run method - Populate the 'contribution' table with fake data

    run() {
        // Generate and insert fake data into the 'contribution' table
        for (let i = 0; i < 10; i += 1) {


            // Generate fake contribution data matching the `contribution` table columns
            const fakeIncident = {

                password_hash: this.faker.string.alphanumeric(60),

            };

            // Insert the fakeContribution data into the 'contribution' table
            this.insert(fakeIncident);
        }
    }
}

export default ContributionSeeder;
