import AbstractSeeder from "./AbstractSeeder";

class IncidentSeeder extends AbstractSeeder {
    constructor() {
        // Call the constructor of the parent class (AbstractSeeder) with appropriate options
        super({ table: "incident", truncate: true });
    }

    // The run method - Populate the 'incident' table with fake data

    run() {
        const locations = [
            { latitude: 49.0750, longitude: 1.5330, city: "Giverny", inseeCode: "27285" },
            { latitude: 49.0700, longitude: 1.5200, city: "Limetz-Villez", inseeCode: "27369" },
            { latitude: 44.4650, longitude: 1.6700, city: "Saint-Cirq-Lapopie", inseeCode: "46256" },
            { latitude: 45.0580, longitude: 1.6550, city: "Collonges-la-Rouge", inseeCode: "19057" },
            { latitude: 43.9120, longitude: 5.2010, city: "Gordes", inseeCode: "84050" },
            { latitude: 48.1670, longitude: 7.2970, city: "Riquewihr", inseeCode: "68277" },
            { latitude: 48.6680, longitude: -1.2640, city: "Barfleur", inseeCode: "50030" },
            { latitude: 43.7740, longitude: 6.2220, city: "Moustiers-Sainte-Marie", inseeCode: "04185" },
            { latitude: 44.8250, longitude: 1.1840, city: "La Roque-Gageac", inseeCode: "24284" },
            { latitude: 43.3070, longitude: -1.5000, city: "Ainhoa", inseeCode: "64016" },
        ];

        // Generate and insert fake data into the 'incident' table
        for (let i = 0; i < locations.length; i += 1) {
            const location = locations[i];


            // Generate fake user data matching the `incident` table columns
            const baseLifespanHours = this.faker.number.int({ min: 2, max: 168 });
            const fakeIncident = {

                title: this.faker.lorem.sentence(25),
                description: this.faker.lorem.paragraph(),
                photoUrl: this.faker.image.urlPicsumPhotos(),
                latitude: location.latitude,
                longitude: location.longitude,
                baseLifespanHours,
                baseAlertRadiusMeters: this.faker.number.int({ min: 100, max: 3000 }),
                city: location.city,
                inseeCode: location.inseeCode,
                status: i % 3 === 0 ? "resolved" : "in_progress",
                expiresAt: new Date(
                    Date.now() + baseLifespanHours * 60 * 60 * 1000,
                ),


            };

            // Insert the fakeUser data into the 'incident' table
            this.insert(fakeIncident);
        }
    }
}

export default IncidentSeeder;
