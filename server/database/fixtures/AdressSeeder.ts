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
			const fakeAddress = {
				user_id: this.getRef(`user_${i}`).insertId,
				label: i === 0 ? "Domicile" : "Adresse principale",
				street_line: `${this.faker.location.streetAddress()}, ${this.faker.location.street()}`,
				postal_code: "27200",
				city: "Vernon",
				insee_code: "27681",
				latitude: 49.09 + i * 0.001,
				longitude: 1.48 + i * 0.001,
				is_approximate: 0,
				is_primary: 1,
			};

			// Insert the fakeAddress data into the 'address' table
			this.insert(fakeAddress);
		}
	}
}

export default AddressSeeder;
