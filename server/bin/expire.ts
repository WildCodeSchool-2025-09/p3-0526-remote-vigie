// Load environment variables from .env file
import "dotenv/config";

// Manual trigger for the US12 expiry task — same run() the cron calls, for
// demos and tests without waiting on the schedule.
import databaseClient from "../database/client";
import expiryService from "../src/services/expiryService";

const expire = async () => {
	await expiryService.run();
	databaseClient.end();
};

expire();
