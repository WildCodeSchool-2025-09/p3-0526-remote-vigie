import AbstractSeeder from "./AbstractSeeder";
import IncidentSeeder from "./IncidentSeeder";

class IncidentIncidentTypeSeeder extends AbstractSeeder {
	constructor() {
		// Call the constructor of the parent class (AbstractSeeder) with appropriate options
		super({
			table: "incident_incident_type",
			truncate: true,
			dependencies: [IncidentSeeder],
		});
	}

	// The run method - Populate the 'incident_incident_type' table with fake data

	run() {
		// incident_type ids (ordre du seed dans schema.sql) :
		// 1 tornado · 2 danger · 3 fire · 4 flood · 5 storm · 6 rockfall · 7 hail
		// 8 glaze · 9 wild · 10 tree · 11 snow · 12 insect · 13 animal
		//
		// Une liste d'ids par incident : la plupart en portent 1, quelques-uns
		// 2, et l'incident 5 en porte 3 (pour couvrir l'affichage multi-types).
		const typeIdsByIncident: number[][] = [
			[3], // 0  Feu (résolu)
			[4], // 1  Inondation
			[9], // 2  Animal sauvage
			[3, 5], // 3  Feu + Tempête (résolu)
			[4, 7], // 4  Inondation + Grêle
			[5, 10, 6], // 5  Tempête + Chute d'arbre + Éboulement
			[12], // 6  Nid d'insectes (résolu)
			[13], // 7  Animal perdu
			[11], // 8  Neige
			[8, 6], // 9  Verglas + Éboulement (résolu)
		];

		for (let i = 0; i < typeIdsByIncident.length; i += 1) {
			const incidentId = this.getRef(`incident_${i}`).insertId;

			for (const typeId of typeIdsByIncident[i]) {
				const association = {
					incident_id: incidentId,
					incident_type_id: typeId,
				};

				this.insert(association);
			}
		}
	}
}

export default IncidentIncidentTypeSeeder;
