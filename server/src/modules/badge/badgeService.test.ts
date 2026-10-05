import badgeRepository from "./badgeRepository";
import type { Badge } from "./badgeRepository";
import badgeService from "./badgeService";
import userBadgeRepository from "./userBadgeRepository";

const userId = 42;

function makeBadge(id: number, code: string, threshold: number): Badge {
	return {
		id,
		code,
		label: code,
		description: `${threshold} ${code}`,
		icon: `${code}.png`,
		counterType: "incident_total",
		counterParam: null,
		threshold,
	};
}

const vigie = makeBadge(1, "vigie", 10);
const pyromane = makeBadge(2, "pyromane", 5);
const referential = [vigie, pyromane];

afterEach(() => {
	jest.restoreAllMocks();
});

// Mocke la lecture du référentiel et les compteurs de l'utilisateur.
function mockActivity(counts: Record<string, number>) {
	jest.spyOn(badgeRepository, "readAll").mockResolvedValue(referential);
	return jest
		.spyOn(badgeRepository, "countActivityByUser")
		.mockResolvedValue(counts);
}

function mockGrantMany() {
	return jest.spyOn(userBadgeRepository, "grantMany").mockResolvedValue(0);
}

describe("badgeService.evaluate", () => {
	test("seuil non atteint : aucun badge n'est attribué", async () => {
		mockActivity({ vigie: 9, pyromane: 4 });
		const grantMany = mockGrantMany();

		const reached = await badgeService.evaluate(userId);

		expect(reached).toEqual([]);
		expect(grantMany).toHaveBeenCalledWith(userId, []);
	});

	test("seuil franchi : le badge est attribué, seuil atteint pile compris", async () => {
		mockActivity({ vigie: 10, pyromane: 7 });
		const grantMany = mockGrantMany();

		const reached = await badgeService.evaluate(userId);

		expect(reached).toEqual([vigie, pyromane]);
		expect(grantMany).toHaveBeenCalledWith(userId, [1, 2]);
	});

	test("seuil franchi pour un seul badge : seul celui-là est attribué", async () => {
		mockActivity({ vigie: 3, pyromane: 5 });
		const grantMany = mockGrantMany();

		const reached = await badgeService.evaluate(userId);

		expect(reached).toEqual([pyromane]);
		expect(grantMany).toHaveBeenCalledWith(userId, [2]);
	});

	test("badge déjà acquis : evaluate le transmet à grantMany, qui l'ignore, sans rien lire de user_badge", async () => {
		mockActivity({ vigie: 12, pyromane: 0 });
		// L'utilisateur possède déjà « vigie » : grantMany répond qu'aucune ligne n'est nouvelle.
		const grantMany = jest
			.spyOn(userBadgeRepository, "grantMany")
			.mockResolvedValue(0);

		const reached = await badgeService.evaluate(userId);

		// La déduplication est portée par la clé primaire (user_id, badge_id),
		// pas par le service : il se contente de transmettre les badges atteints.
		expect(reached).toEqual([vigie]);
		expect(grantMany).toHaveBeenCalledTimes(1);
		expect(grantMany).toHaveBeenCalledWith(userId, [1]);
	});

	test("activité en baisse : aucun badge n'est retiré, rien n'est attribué", async () => {
		const countActivityByUser = mockActivity({ vigie: 10, pyromane: 0 });
		const grantMany = mockGrantMany();

		await badgeService.evaluate(userId);
		expect(grantMany).toHaveBeenLastCalledWith(userId, [1]);

		// L'activité qui avait déclenché « vigie » diminue (signalements supprimés).
		countActivityByUser.mockResolvedValue({ vigie: 2, pyromane: 0 });
		const reached = await badgeService.evaluate(userId);

		// Rien d'attribué ; evaluate n'a aucun moyen de retirer un badge acquis :
		// seule grantMany est appelée, jamais une suppression.
		expect(reached).toEqual([]);
		expect(grantMany).toHaveBeenLastCalledWith(userId, []);
		expect(grantMany).toHaveBeenCalledTimes(2);
	});

	test("idempotence : rejouée avec la même activité, l'évaluation donne le même résultat et n'attribue rien de plus", async () => {
		mockActivity({ vigie: 10, pyromane: 5 });
		const grantMany = jest
			.spyOn(userBadgeRepository, "grantMany")
			.mockResolvedValueOnce(2) // 1re évaluation : deux nouveaux badges
			.mockResolvedValueOnce(0); // 2e évaluation : plus rien de nouveau

		const first = await badgeService.evaluate(userId);
		const second = await badgeService.evaluate(userId);

		expect(second).toEqual(first);
		expect(grantMany).toHaveBeenNthCalledWith(1, userId, [1, 2]);
		expect(grantMany).toHaveBeenNthCalledWith(2, userId, [1, 2]);
	});

	test("un compteur absent vaut 0", async () => {
		mockActivity({});
		const grantMany = mockGrantMany();

		const reached = await badgeService.evaluate(userId);

		expect(reached).toEqual([]);
		expect(grantMany).toHaveBeenCalledWith(userId, []);
	});

	test("échec de lecture des compteurs : l'erreur remonte et rien n'est attribué", async () => {
		jest.spyOn(badgeRepository, "readAll").mockResolvedValue(referential);
		jest.spyOn(badgeRepository, "countActivityByUser").mockRejectedValue(
			new Error("base indisponible"),
		);
		const grantMany = mockGrantMany();

		await expect(badgeService.evaluate(userId)).rejects.toThrow(
			"base indisponible",
		);
		expect(grantMany).not.toHaveBeenCalled();
	});

	test("les compteurs sont demandés pour l'utilisateur et pour tout le référentiel", async () => {
		const countActivityByUser = mockActivity({});
		mockGrantMany();

		await badgeService.evaluate(userId);

		expect(countActivityByUser).toHaveBeenCalledWith(userId, referential);
	});
});

describe("badgeService.findReachedBadges", () => {
	test("compare chaque compteur au seuil de son badge", () => {
		const reached = badgeService.findReachedBadges(referential, {
			vigie: 9,
			pyromane: 5,
		});

		expect(reached).toEqual([pyromane]);
	});
});
