import databaseClient from "../../../database/client";

import type { Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

type CommentRow = {
	id: number;
	content: string;
	createdAt: Date;
	author: { pseudo: string };
};

class CommentRepository {
	async browse(incidentId: number): Promise<CommentRow[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT c.id, c.content, c.created_at, u.pseudo AS author_pseudo
			FROM comment AS c
			INNER JOIN user AS u ON u.id = c.user_id
			WHERE c.incident_id = ?
			ORDER BY c.id ASC`,
			[incidentId],
		);

		return rows.map((row) => ({
			id: row.id,
			content: row.content,
			createdAt: row.created_at,
			author: { pseudo: row.author_pseudo },
		}));
	}
}

export default new CommentRepository();
