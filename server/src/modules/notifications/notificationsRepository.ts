import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class NotificationsRepository {
  async browseSinceLastSeen(
    userId: number,
    lastSeenAt: Date | null,
    limit = 20,
    offset = 0,
  ) {
    const [rows] = await databaseClient.query<Rows>(
      `(
         SELECT
           'incident' AS type,
           incident.id AS source_id,
           incident.created_at,
           incident.id AS incident_id,
           incident.city,
           incident.status
         FROM incident
         WHERE incident.user_id != ?
           AND incident.status = 'in_progress'
           AND incident.expires_at > NOW()
           AND (? IS NULL OR incident.created_at > ?)
           AND EXISTS (
             SELECT 1
             FROM address
             WHERE address.user_id = ?
               AND ST_Distance_Sphere(
                 POINT(address.longitude, address.latitude),
                 POINT(incident.longitude, incident.latitude)
               ) <= incident.base_alert_radius_meters
           )
       )
       UNION ALL
       (
         SELECT
           'comment' AS type,
           comment.id AS source_id,
           comment.created_at,
           incident.id AS incident_id,
           incident.city,
           incident.status
         FROM comment
         JOIN incident ON incident.id = comment.incident_id
         WHERE incident.user_id = ?
           AND comment.user_id != ?
           AND (? IS NULL OR comment.created_at > ?)
       )
       UNION ALL
       (
         SELECT
           'incident_resolved' AS type,
           incident.id AS source_id,
           incident.updated_at AS created_at,
           incident.id AS incident_id,
           incident.city,
           incident.status
         FROM incident
         WHERE incident.user_id = ?
           AND incident.status = 'resolved'
           AND (? IS NULL OR incident.updated_at > ?)
       )
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [
        userId,
        lastSeenAt,
        lastSeenAt,
        userId,
        userId,
        userId,
        lastSeenAt,
        lastSeenAt,
        userId,
        lastSeenAt,
        lastSeenAt,
        limit,
        offset,
      ],
    );

    return rows;
  }

  async countSinceLastSeen(userId: number, lastSeenAt: Date | null) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS count FROM (
         SELECT incident.id
         FROM incident
         WHERE incident.user_id != ?
           AND incident.status = 'in_progress'
           AND incident.expires_at > NOW()
           AND (? IS NULL OR incident.created_at > ?)
           AND EXISTS (
             SELECT 1
             FROM address
             WHERE address.user_id = ?
               AND ST_Distance_Sphere(
                 POINT(address.longitude, address.latitude),
                 POINT(incident.longitude, incident.latitude)
               ) <= incident.base_alert_radius_meters
           )
         UNION ALL
         SELECT comment.id FROM comment
         JOIN incident ON incident.id = comment.incident_id
         WHERE incident.user_id = ? AND comment.user_id != ?
           AND (? IS NULL OR comment.created_at > ?)
         UNION ALL
         SELECT incident.id FROM incident
         WHERE incident.user_id = ? AND incident.status = 'resolved'
           AND (? IS NULL OR incident.updated_at > ?)
       ) AS events`,
      [
        userId,
        lastSeenAt,
        lastSeenAt,
        userId,
        userId,
        userId,
        lastSeenAt,
        lastSeenAt,
        userId,
        lastSeenAt,
        lastSeenAt,
      ],
    );

    return (rows as { count: number }[])[0].count;
  }
}

export default new NotificationsRepository();