import createIpRateLimit from "./createIpRateLimit";

const checkResendVerificationRateLimit = createIpRateLimit({
	max: 3,
	windowMs: 15 * 60 * 1000,
	message: "Trop de demandes de renvoi. Veuillez réessayer plus tard.",
});

export default checkResendVerificationRateLimit;
