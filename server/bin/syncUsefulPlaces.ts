// Load environment variables from .env file
import "dotenv/config";

// Lancement manuel : remplit la table `useful_place` depuis Overpass.
// Sans argument, toutes les catégories ; sinon seulement celles indiquées :
// npm run sync:places -- fire_station veterinary
import databaseClient from "../database/client";
import usefulPlaceSyncService from "../src/services/usefulPlaceSyncService";

const sync = async () => {
	try {
		const categories = usefulPlaceSyncService.parseCategories(
			process.argv.slice(2),
		);
		await usefulPlaceSyncService.run(categories);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	} finally {
		await databaseClient.end();
	}
};

sync();
