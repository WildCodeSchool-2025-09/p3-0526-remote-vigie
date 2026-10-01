import contributionService from "./contributionService";

const createdAt = new Date("2026-01-01T00:00:00.000Z");

function hoursAfter(hours: number): Date {
	return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
}

describe("contributionService.recalculateExpiry", () => {
	test("sans contribution, la durée reste la durée de base", () => {
		const expiresAt = contributionService.recalculateExpiry(24, createdAt, {
			confirm: 0,
			deny: 0,
		});

		expect(expiresAt).toEqual(hoursAfter(24));
	});

	test("avec des confirmations, chacune ajoute 15 % de la durée de base", () => {
		const expiresAt = contributionService.recalculateExpiry(20, createdAt, {
			confirm: 2,
			deny: 0,
		});

		// bonus par confirmation = 20 * 0.15 = 3h, x2 confirmations = 6h
		expect(expiresAt).toEqual(hoursAfter(26));
	});

	test("le bonus par confirmation est plafonné à 4h, même sur une longue durée de base", () => {
		const expiresAt = contributionService.recalculateExpiry(48, createdAt, {
			confirm: 3,
			deny: 0,
		});

		// bonus brut par confirmation = 48 * 0.15 = 7.2h, plafonné à 4h, x3 = 12h
		expect(expiresAt).toEqual(hoursAfter(60));
	});

	test("avec des infirmations, chacune retire 25 % de la durée de base", () => {
		const expiresAt = contributionService.recalculateExpiry(24, createdAt, {
			confirm: 0,
			deny: 2,
		});

		// malus = 24 * 0.25 * 2 = 12h
		expect(expiresAt).toEqual(hoursAfter(12));
	});

	test("la durée ne descend jamais sous zéro", () => {
		const expiresAt = contributionService.recalculateExpiry(24, createdAt, {
			confirm: 0,
			deny: 10,
		});

		// malus brut = 24 * 0.25 * 10 = 60h, largement negatif une fois soustrait : borné à 0
		expect(expiresAt).toEqual(hoursAfter(0));
	});

	test("la durée ne dépasse jamais le double de la durée de base", () => {
		const expiresAt = contributionService.recalculateExpiry(24, createdAt, {
			confirm: 20,
			deny: 0,
		});

		// bonus brut = 3.6 * 20 = 72h, dépasse largement 2 * 24 = 48h : borné à 48h
		expect(expiresAt).toEqual(hoursAfter(48));
	});

	test("le recalcul est idempotent : mêmes contributions, même résultat", () => {
		const counts = { confirm: 3, deny: 1 };

		const first = contributionService.recalculateExpiry(
			24,
			createdAt,
			counts,
		);
		const second = contributionService.recalculateExpiry(
			24,
			createdAt,
			counts,
		);

		expect(second).toEqual(first);
	});
});
