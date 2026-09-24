// Get variables from .env file for database connection
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Create a connection pool to the database
import mysql from "mysql2/promise";

const client = mysql.createPool({
	host: DB_HOST,
	port: Number.parseInt(DB_PORT as string),
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
});

// Ready to export
export default client;

// Types export
import type {
	Pool,
	PoolConnection,
	ResultSetHeader,
	RowDataPacket,
} from "mysql2/promise";

type DatabaseClient = Pool;
type Result = ResultSetHeader;
type Rows = RowDataPacket[];
// A repository method can run on the pool directly, or on a connection
// checked out for a transaction (see contributionActions.add).
type Executor = Pool | PoolConnection;

export type { DatabaseClient, Result, Rows, Executor };
