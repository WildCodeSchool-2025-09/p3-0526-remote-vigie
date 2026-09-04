import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class IncidentSeeder extends AbstractSeeder {
  constructor() {
    // Call the constructor of the parent class (AbstractSeeder) with appropriate options
    super({ table: "incident", truncate: true, dependencies: [UserSeeder] });
  }

  // The run method - Populate the 'incident' table with fake data

  run() {
    const locations = [
      {
        latitude: 49.075,
        longitude: 1.533,
        city: "Giverny",
        inseeCode: "27285",
      },
      {
        latitude: 49.07,
        longitude: 1.52,
        city: "Limetz-Villez",
        inseeCode: "27369",
      },
      {
        latitude: 44.465,
        longitude: 1.67,
        city: "Saint-Cirq-Lapopie",
        inseeCode: "46256",
      },
      {
        latitude: 45.058,
        longitude: 1.655,
        city: "Collonges-la-Rouge",
        inseeCode: "19057",
      },
      {
        latitude: 43.912,
        longitude: 5.201,
        city: "Gordes",
        inseeCode: "84050",
      },
      {
        latitude: 48.167,
        longitude: 7.297,
        city: "Riquewihr",
        inseeCode: "68277",
      },
      {
        latitude: 48.668,
        longitude: -1.264,
        city: "Barfleur",
        inseeCode: "50030",
      },
      {
        latitude: 43.774,
        longitude: 6.222,
        city: "Moustiers-Sainte-Marie",
        inseeCode: "04185",
      },
      {
        latitude: 44.825,
        longitude: 1.184,
        city: "La Roque-Gageac",
        inseeCode: "24284",
      },
      { latitude: 43.307, longitude: -1.5, city: "Ainhoa", inseeCode: "64016" },
    ];

    // Generate and insert fake data into the 'incident' table
    for (let i = 0; i < locations.length; i += 1) {
      const location = locations[i];

      // Generate fake incident data matching the `incident` table columns
      const baseLifespanHours = this.faker.number.int({ min: 2, max: 168 });
      const fakeIncident = {
        user_id: this.getRef(`user_${i}`).insertId,
        danger_level_id: this.faker.number.int({ min: 1, max: 5 }),
        title: this.faker.lorem.sentence({ min: 5, max: 10 }),
        description: this.faker.lorem.paragraph(),
        photo_url: this.faker.image.urlPicsumPhotos(),
        latitude: location.latitude,
        longitude: location.longitude,
        base_lifespan_hours: baseLifespanHours,
        base_alert_radius_meters: this.faker.number.int({
          min: 100,
          max: 3000,
        }),
        city: location.city,
        insee_code: location.inseeCode,
        status: i % 3 === 0 ? "resolved" : "in_progress",
        expires_at: new Date(Date.now() + baseLifespanHours * 60 * 60 * 1000),
        refName: `incident_${i}`,
      };

      // Insert the fakeIncident data into the 'incident' table
      this.insert(fakeIncident);
    }
  }
}

export default IncidentSeeder;
