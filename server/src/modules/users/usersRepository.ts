import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class UsersRepository {
  async first() {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM user ORDER BY id ASC LIMIT 1",
    );
    return (rows as any[])[0];
  }

  async read(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM user WHERE id = ?",
      [userId],
    );
    return (rows as any[])[0];
  }

  async updateLastSeenAt(userId: number) {
    await databaseClient.query(
      "UPDATE user SET last_seen_at = NOW() WHERE id = ?",
      [userId],
    );
  }
}

export default new UsersRepository();