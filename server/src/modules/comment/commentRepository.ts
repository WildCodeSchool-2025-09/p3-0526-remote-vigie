import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

type CommentRow = {
	id: number;
	content: string;
	createdAt: Date;
	author: { pseudo: string };
	quotedComment: { author: { pseudo: string }; content: string } | null;
};

class CommentRepository {
	async browseByIncident(incidentId: number): Promise<CommentRow[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT
				c.id, c.content, c.created_at, u.pseudo AS author_pseudo,
				qc.content AS quoted_content, qu.pseudo AS quoted_author_pseudo
			FROM comment AS c
			INNER JOIN user AS u ON u.id = c.user_id
			LEFT JOIN comment AS qc ON qc.id = c.quoted_comment_id
			LEFT JOIN user AS qu ON qu.id = qc.user_id
			WHERE c.incident_id = ?
			ORDER BY c.id ASC`,
			[incidentId],
		);

		return rows.map((row) => ({
			id: row.id,
			content: row.content,
			createdAt: row.created_at,
			author: { pseudo: row.author_pseudo },
			quotedComment:
				row.quoted_content == null
					? null
					: {
							author: { pseudo: row.quoted_author_pseudo },
							content: row.quoted_content,
						},
		}));
	}

	async create(data: {
		userId: number;
		incidentId: number;
		content: string;
	}): Promise<number> {
		const [result] = await databaseClient.query<Result>(
			`INSERT INTO comment (user_id, incident_id, content)
			VALUES (?, ?, ?)`,
			[data.userId, data.incidentId, data.content],
		);

		return result.insertId;
	}
}

export default new CommentRepository();
