import createIpRateLimit from "./createIpRateLimit";

const checkRegisterRateLimit = createIpRateLimit({
	max: 5,
	windowMs: 60 * 60 * 1000,
	message: "Trop de tentatives d'inscription. Veuillez réessayer plus tard.",
});

export default checkRegisterRateLimit;
