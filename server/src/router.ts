import express from "express";
import decodePhoto from "./middlewares/decodePhoto";
import requireIncidentAuthor from "./middlewares/requireIncidentAuthor";
import validateLoginInput from "./middlewares/validateLoginInput";
import addressActions from "./modules/address/addressActions";
import authActions from "./modules/auth/authActions";
import googleAuthActions from "./modules/auth/googleAuthActions";
import badgeActions from "./modules/badge/badgeActions";
import commentActions from "./modules/comment/commentActions";
import contributionActions from "./modules/contribution/contributionActions";
import dangerActions from "./modules/danger/dangerActions";
import incidentActions from "./modules/incident/incidentActions";
import incidentTypeActions from "./modules/incidentType/incidentTypeActions";
import notificationsActions from "./modules/notifications/notificationsActions";
import photoActions from "./modules/photo/photoActions";
import pushSubscriptionActions from "./modules/pushSubscription/pushSubscriptionActions";
import usefulPlaceActions from "./modules/usefulPlace/usefulPlaceActions";
import usersActions from "./modules/users/usersActions";
import attachUserIfPresent from "./services/attachUserIfPresent";
import checkAddressSearchRateLimit from "./services/checkAddressSearchRateLimit";
import checkIncidentRateLimit from "./services/checkIncidentRateLimit";
import checkRegisterRateLimit from "./services/checkRegisterRateLimit";
import checkResendVerificationRateLimit from "./services/checkResendVerificationRateLimit";
import checkUserUniqueness from "./services/checkUserUniqueness";
import requireVerifiedEmail from "./services/requireVerifiedEmail";
import validateGoogleSignupInput from "./services/validateGoogleSignupInput";
import validateRegisterInput from "./services/validateRegisterInput";
import verifyToken from "./services/verifyToken";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.post("/api/auth/login", validateLoginInput, authActions.login);

router.get("/api/auth/google", googleAuthActions.redirectToGoogle);

router.get("/api/auth/google/callback", googleAuthActions.handleGoogleCallback);

router.post(
	"/api/auth/google/signup",
	validateGoogleSignupInput,
	checkRegisterRateLimit,
	googleAuthActions.completeGoogleSignup,
);

router.get("/api/auth/me", verifyToken, authActions.me);

router.get("/api/badges/me", verifyToken, badgeActions.browse);

router.post(
	"/api/incidents",
	verifyToken,
	requireVerifiedEmail,
	checkIncidentRateLimit,
	decodePhoto,
	incidentActions.add,
);
router.post(
	"/api/incidents/danger",
	verifyToken,
	checkIncidentRateLimit,
	dangerActions.add,
);

router.get("/uploads/:filename", photoActions.read);

router.get("/api/incident-types", incidentTypeActions.browse);

router.get("/api/incidents/nearby", incidentActions.browseNearby);
router.get("/api/incidents", incidentActions.browse);
router.get("/api/incidents/:id", attachUserIfPresent, incidentActions.read);
router.put(
	"/api/incidents/:id",
	verifyToken,
	requireIncidentAuthor,
	decodePhoto,
	incidentActions.edit,
);
router.post(
	"/api/incidents/:id/contributions",
	verifyToken,
	contributionActions.add,
);

router.get(
	"/api/incidents/:id/comments",
	attachUserIfPresent,
	commentActions.browse,
);
router.post("/api/incidents/:id/comments", verifyToken, commentActions.add);

router.get("/api/useful-places", usefulPlaceActions.browse);

router.get("/api/notifications", verifyToken, notificationsActions.browse);

router.get(
	"/api/notifications/unread-count",
	verifyToken,
	notificationsActions.unreadCount,
);

router.put(
	"/api/notifications/seen",
	verifyToken,
	notificationsActions.markSeen,
);

router.get(
	"/api/push-subscriptions/public-key",
	pushSubscriptionActions.readPublicKey,
);
router.post(
	"/api/push-subscriptions",
	verifyToken,
	pushSubscriptionActions.add,
);
router.delete(
	"/api/push-subscriptions",
	verifyToken,
	pushSubscriptionActions.destroy,
);

router.get("/api/addresses/reverse", verifyToken, addressActions.reverse);
router.get(
	"/api/addresses/search",
	checkAddressSearchRateLimit,
	addressActions.search,
);
router.post(
	"/api/users",
	validateRegisterInput,
	checkRegisterRateLimit,
	checkUserUniqueness,
	authActions.hashPassword,
	usersActions.add,
);
router.post("/api/users/verify-email", usersActions.verifyEmail);
router.post(
	"/api/users/resend-verification",
	checkResendVerificationRateLimit,
	usersActions.resendVerification,
);
router.patch("/api/users/me/pseudo", verifyToken, usersActions.updatePseudo);
router.delete("/api/users/me", verifyToken, usersActions.destroy);

export default router;
