import AbstractSeeder from "./AbstractSeeder";
import IncidentSeeder from "./IncidentSeeder";
import UserSeeder from "./UserSeeder";

class CommentSeeder extends AbstractSeeder {
    constructor() {
        // Call the constructor of the parent class (AbstractSeeder) with appropriate options
        super({ table: "comment", truncate: true, dependencies: [IncidentSeeder, UserSeeder] });
    }

    // The run method - Populate the 'comment' table with fake data

    run() {
        // Generate and insert fake data into the 'comment' table
        for (let i = 0; i < 10; i += 1) {


            // Generate fake comment data matching the `comment` table columns
            const fakeIncident = {

                password_hash: this.faker.string.alphanumeric(60),

            };

            // Insert the fakeComment data into the 'comment' table
            this.insert(fakeIncident);
        }
    }
}

export default CommentSeeder;
