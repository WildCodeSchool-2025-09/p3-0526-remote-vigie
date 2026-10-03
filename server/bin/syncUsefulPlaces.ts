// Load environment variables from .env file
import "dotenv/config";

// Lancement manuel : remplit la table `useful_place` depuis Overpass.
import databaseClient from "../database/client";
import usefulPlaceSyncService from "../src/services/usefulPlaceSyncService";

const sync = async () => {
	await usefulPlaceSyncService.run();
	databaseClient.end();
};

sync();
