import createIpRateLimit from "./createIpRateLimit";

const checkAddressSearchRateLimit = createIpRateLimit({
	max: 30,
	windowMs: 60 * 1000,
	message: "Trop de recherches d'adresse. Veuillez réessayer plus tard.",
});

export default checkAddressSearchRateLimit;
