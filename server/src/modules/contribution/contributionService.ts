const CONFIRM_BONUS_RATIO = 0.15;
const CONFIRM_BONUS_MAX_HOURS = 4;
const DENY_MALUS_RATIO = 0.25;

function recalculateExpiry(
	baseLifespanHours: number,
	createdAt: Date,
	counts: { confirm: number; deny: number },
): Date {
	const bonusPerConfirm = Math.min(
		baseLifespanHours * CONFIRM_BONUS_RATIO,
		CONFIRM_BONUS_MAX_HOURS,
	);
	const bonus = bonusPerConfirm * counts.confirm;
	const malus = baseLifespanHours * DENY_MALUS_RATIO * counts.deny;

	const durationHours = Math.min(
		Math.max(baseLifespanHours + bonus - malus, 0),
		baseLifespanHours * 2,
	);

	return new Date(createdAt.getTime() + durationHours * 60 * 60 * 1000);
}

export default { recalculateExpiry };
