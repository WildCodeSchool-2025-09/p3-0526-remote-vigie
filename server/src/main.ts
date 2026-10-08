// Load environment variables from .env file
import "dotenv/config";

// Check database connection
// Note: This is optional and can be removed if the database connection
// is not required when starting the application
import "../database/checkConnection";

// Import the Express application from ./app
import app from "./app";

// Start the incident-expiry cron (US12)
import expiryService from "./services/expiryService";

expiryService.schedule();

// Report the Web Push configuration at startup (US21): a missing key shows in
// the deployment logs, not at the first alert
import webPushClient from "./services/webPushClient";

if (webPushClient.getWebPush() != null) {
	console.info("Web Push activé");
}

// Get the port from the environment variables
const port = process.env.APP_PORT;

// Start the server and listen on the specified port
app.listen(port, () => {
	console.info(`Server is listening on port ${port}`);
}).on("error", (err: Error) => {
	console.error("Error:", err.message);
});
