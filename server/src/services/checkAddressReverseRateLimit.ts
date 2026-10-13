import createIpRateLimit from "./createIpRateLimit";

const checkAddressReverseRateLimit = createIpRateLimit({
	max: 30,
	windowMs: 60 * 1000,
	message: "Trop de recherches de commune. Veuillez réessayer plus tard.",
});

export default checkAddressReverseRateLimit;
