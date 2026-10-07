// Remembered per device and per user
const answerKey = (userId: number) => `vigie_push_prompt_${userId}`;
// Separate key: closing the iOS hint is not answering the activation prompt
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
	} catch {}
}

// After a sign-out the device no longer receives alerts: the next sign-in must
// offer the activation again
export const forgetPushPromptAnswer = (userId: number) => {
	try {
		localStorage.removeItem(answerKey(userId));
	} catch {
		// Storage unavailable: nothing to forget
	}
};
export const hasAnsweredPushPrompt = (userId: number) =>
	isStored(answerKey(userId));
export const markPushPromptAnswered = (userId: number) =>
	store(answerKey(userId));
export const hasClosedInstallHint = (userId: number) =>
	isStored(installHintKey(userId));
export const markInstallHintClosed = (userId: number) =>
	store(installHintKey(userId));
