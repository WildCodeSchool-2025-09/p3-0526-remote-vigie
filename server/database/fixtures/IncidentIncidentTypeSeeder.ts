import AbstractSeeder from "./AbstractSeeder";
import IncidentSeeder from "./IncidentSeeder";

class IncidentIncidentTypeSeeder extends AbstractSeeder {
    constructor() {
        // Call the constructor of the parent class (AbstractSeeder) with appropriate options
        super({ table: "incident_incident_type", truncate: true, dependencies: [IncidentSeeder] });
    }

    // The run method - Populate the 'incident_incident_type' table with fake data

    run() {
        // Generate and insert fake data into the 'incident_incident_type' table
        for (let i = 0; i < 10; i += 1) {


            // Generate fake association data matching the `incident_incident_type` table columns
            const fakeIncident = {

                password_hash: this.faker.string.alphanumeric(60),

            };

            // Insert the fake association into the 'incident_incident_type' table
            this.insert(fakeIncident);
        }
    }
}

export default IncidentIncidentTypeSeeder;
