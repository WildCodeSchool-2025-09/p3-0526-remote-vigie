// Mémoire locale de l'encart d'activation (US21). Par appareil (le push est une
// décision par appareil) et par utilisateur (deux comptes sur un navigateur ont
// chacun la leur).
const answerKey = (userId: number) => `vigie_push_prompt_${userId}`;
// Les instructions d'installation iOS ont leur propre mémoire : les fermer n'est
// pas répondre à la proposition d'activation. L'application installée a de
// toute façon un stockage séparé de Safari, l'activation y sera proposée.
const installHintKey = (userId: number) => `vigie_push_ios_hint_${userId}`;

function isStored(key: string): boolean {
	try {
		return localStorage.getItem(key) != null;
	} catch {
		return false;
	}
}

function store(key: string) {
	try {
		localStorage.setItem(key, "answered");
	} catch {
		// Stockage indisponible : l'encart pourra revenir, sans conséquence grave.
	}
}

export const hasAnsweredPushPrompt = (userId: number) =>
	isStored(answerKey(userId));
export const markPushPromptAnswered = (userId: number) =>
	store(answerKey(userId));
export const hasClosedInstallHint = (userId: number) =>
	isStored(installHintKey(userId));
export const markInstallHintClosed = (userId: number) =>
	store(installHintKey(userId));
