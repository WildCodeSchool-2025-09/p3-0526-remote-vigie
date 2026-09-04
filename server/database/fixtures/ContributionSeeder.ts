import AbstractSeeder from "./AbstractSeeder";
import IncidentSeeder from "./IncidentSeeder";
import UserSeeder from "./UserSeeder";

class ContributionSeeder extends AbstractSeeder {
  constructor() {
    // Call the constructor of the parent class (AbstractSeeder) with appropriate options
    super({
      table: "contribution",
      truncate: true,
      dependencies: [IncidentSeeder, UserSeeder],
    });
  }

  // The run method - Populate the 'contribution' table with fake data

  run() {
    // Generate and insert fake data into the 'contribution' table
    for (let i = 0; i < 10; i += 1) {
      // Generate fake contribution data matching the `contribution` table columns
      const fakeContribution = {
        incident_id: this.getRef(`incident_${i}`).insertId,
        user_id: this.getRef(`user_${(i + 1) % 10}`).insertId,
        type: i % 2 === 0 ? "confirm" : "deny",
      };

      // Insert the fakeContribution data into the 'contribution' table
      this.insert(fakeContribution);
    }
  }
}

export default ContributionSeeder;
