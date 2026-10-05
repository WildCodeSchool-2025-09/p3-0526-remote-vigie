import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

// Only CRUD here (Create, Read, Update, Delete)

// Doit rester synchronisé avec l'ENUM `badge.counter_type` du schema.sql.
export type BadgeCounterType =
	| "incident_by_type"
	| "incident_total"
	| "comment_total"
	| "contribution_total"
	| "confirmed_incident"
	| "first_on_spot"
	| "all_types";

export type Badge = {
	id: number;
	code: string;
	label: string;
	description: string;
	icon: string;
	counterType: BadgeCounterType;
	counterParam: string | null;
	threshold: number;
};

class BadgeRepository {
	async readAll(): Promise<Badge[]> {
		const [rows] = await databaseClient.query<Rows>(
			`SELECT
				id, code, label, description, icon,
				counter_type, counter_param, threshold
			FROM badge
			ORDER BY id ASC`,
		);

		return rows.map((row) => ({
			id: row.id,
			code: row.code,
			label: row.label,
			description: row.description,
			icon: row.icon,
			counterType: row.counter_type,
			counterParam: row.counter_param,
			threshold: row.threshold,
		}));
	}

	// Un compteur par badge, indexé par le code du badge. Ces compteurs servent à
	// l'attribution (comparaison au seuil) et à la progression « N/seuil » du profil.
	async countActivityByUser(
		userId: number,
		badges: Badge[],
	): Promise<Record<string, number>> {
		const counts = await Promise.all(
			badges.map((badge) => this.countForBadge(userId, badge)),
		);

		return Object.fromEntries(
			badges.map((badge, index) => [badge.code, counts[index]]),
		);
	}

	private async countForBadge(userId: number, badge: Badge): Promise<number> {
		switch (badge.counterType) {
			case "incident_total":
				return this.countIncidents(userId);
			case "incident_by_type":
				return this.countIncidentsByTypes(
					userId,
					parseCounterParam(badge.counterParam),
				);
			case "comment_total":
				return this.countComments(userId);
			case "contribution_total":
				return this.countContributions(userId);
			case "confirmed_incident":
				return this.countConfirmedIncidents(
					userId,
					Number(badge.counterParam),
				);
			case "all_types":
				return this.countAllTypesIncidents(userId);
			case "first_on_spot":
				return this.countFirstOnSpotIncidents(userId);
		}
	}

	private async countIncidents(userId: number): Promise<number> {
		return this.count(
			"SELECT COUNT(*) AS total FROM incident WHERE user_id = ?",
			[userId],
		);
	}

	// COUNT(DISTINCT) : un incident portant plusieurs des types demandés n'est
	// compté qu'une fois.
	private async countIncidentsByTypes(
		userId: number,
		typeCodes: string[],
	): Promise<number> {
		if (typeCodes.length === 0) return 0;

		return this.count(
			`SELECT COUNT(DISTINCT i.id) AS total
			FROM incident AS i
			INNER JOIN incident_incident_type AS iit ON iit.incident_id = i.id
			INNER JOIN incident_type AS t ON t.id = iit.incident_type_id
			WHERE i.user_id = ? AND t.code IN (?)`,
			[userId, typeCodes],
		);
	}

	private async countComments(userId: number): Promise<number> {
		return this.count(
			"SELECT COUNT(*) AS total FROM comment WHERE user_id = ?",
			[userId],
		);
	}

	private async countContributions(userId: number): Promise<number> {
		return this.count(
			"SELECT COUNT(*) AS total FROM contribution WHERE user_id = ?",
			[userId],
		);
	}

	// Signalements de l'utilisateur confirmés par au moins `minConfirmations`
	// autres utilisateurs (la clé primaire de `contribution` garantit des votants
	// distincts, et l'auteur ne peut pas voter sur son propre signalement).
	private async countConfirmedIncidents(
		userId: number,
		minConfirmations: number,
	): Promise<number> {
		if (!Number.isInteger(minConfirmations) || minConfirmations < 1)
			return 0;

		return this.count(
			`SELECT COUNT(*) AS total FROM (
				SELECT i.id
				FROM incident AS i
				INNER JOIN contribution AS c
					ON c.incident_id = i.id AND c.type = 'confirm'
				WHERE i.user_id = ?
				GROUP BY i.id
				HAVING COUNT(*) >= ?
			) AS confirmed`,
			[userId, minConfirmations],
		);
	}

	// Signalements de l'utilisateur portant tous les types sélectionnables. La
	// clé primaire de `incident_incident_type` garantit un type une seule fois
	// par signalement ; le total à atteindre est recalculé, jamais figé.
	private async countAllTypesIncidents(userId: number): Promise<number> {
		return this.count(
			`SELECT COUNT(*) AS total FROM (
				SELECT i.id
				FROM incident AS i
				INNER JOIN incident_incident_type AS iit ON iit.incident_id = i.id
				INNER JOIN incident_type AS t
					ON t.id = iit.incident_type_id AND t.is_selectable = 1
				WHERE i.user_id = ?
				GROUP BY i.id
				HAVING COUNT(*) = (
					SELECT COUNT(*) FROM incident_type WHERE is_selectable = 1
				)
			) AS complete`,
			[userId],
		);
	}

	// Signalements de l'utilisateur créés « là où rien n'était encore signalé » : aucun
	// signalement antérieur, encore dans sa durée de vie de base, ayant un type en
	// commun, à une distance inférieure à la somme des deux rayons d'alerte. Même
	// règle de doublon qu'à la création (incidentActions.browseNearby), recalculée
	// a posteriori : rien n'est stocké au moment de la création. Les signalements
	// de l'utilisateur lui-même comptent comme précédents ; à égalité de date,
	// l'id départage.
	private async countFirstOnSpotIncidents(userId: number): Promise<number> {
		return this.count(
			`SELECT COUNT(*) AS total
			FROM incident AS i
			WHERE i.user_id = ?
			AND NOT EXISTS (
				SELECT 1
				FROM incident AS j
				INNER JOIN incident_incident_type AS jt ON jt.incident_id = j.id
				INNER JOIN incident_incident_type AS it
					ON it.incident_id = i.id
					AND it.incident_type_id = jt.incident_type_id
				WHERE j.id <> i.id
				AND (
					j.created_at < i.created_at
					OR (j.created_at = i.created_at AND j.id < i.id)
				)
				AND DATE_ADD(j.created_at, INTERVAL j.base_lifespan_hours HOUR)
					> i.created_at
				AND ST_Distance_Sphere(
					POINT(j.longitude, j.latitude),
					POINT(i.longitude, i.latitude)
				) <= j.base_alert_radius_meters + i.base_alert_radius_meters
			)`,
			[userId],
		);
	}

	private async count(sql: string, params: unknown[]): Promise<number> {
		const [rows] = await databaseClient.query<Rows>(sql, params);
		return Number(rows[0].total);
	}
}

// « storm,hail,tornado » → ["storm", "hail", "tornado"]
function parseCounterParam(counterParam: string | null): string[] {
	return (counterParam ?? "")
		.split(",")
		.map((code) => code.trim())
		.filter((code) => code !== "");
}

export default new BadgeRepository();
