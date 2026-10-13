import { useAuth } from "@/contexts/auth/AuthContext";
import type { AddressSuggestion } from "@/services/addressService";
import { googleSignup } from "@/services/googleAuthService";
import { register } from "@/services/userService";
import type { RegisterPayload } from "@/services/userService";
import type { RegisterFieldError } from "@/types/register";
import getPseudoError from "@/utils/getPseudoError";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

type Params = {
	selectedAddress: AddressSuggestion | null;
	addressServiceUnavailable: boolean;
	manualMode: boolean;
	city: string;
	postalCode: string;
	pendingToken?: string | null;
};

export default function useRegisterSubmit({
	selectedAddress,
	addressServiceUnavailable,
	manualMode,
	city,
	postalCode,
	pendingToken = null,
}: Params) {
	const navigate = useNavigate();

	const { loginWithToken } = useAuth();

	const pseudoRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [cguAccepted, setCguAccepted] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<RegisterFieldError>({});
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	useEffect(() => {
		const fieldOrder: (keyof RegisterFieldError)[] = [
			"pseudo",
			"email",
			"password",
			"address",
			"cgu",
		];
		const firstField = fieldOrder.find((field) => fieldErrors[field]);
		if (!firstField) return;

		const id =
			firstField === "address" && manualMode
				? "register-city"
				: `register-${firstField}`;

		document.getElementById(id)?.focus();
	}, [fieldErrors, manualMode]);

	// Mode Google (US22) : pas de mot de passe, le compte est créé déjà vérifié
	// et l'utilisateur est connecté directement.
	async function submitGoogleSignup(
		token: string,
		pseudo: string,
		address: RegisterPayload["address"],
	) {
		const result = await googleSignup({
			pendingToken: token,
			pseudo,
			cguAccepted,
			address,
		});

		if (result.status === "ok") {
			try {
				await loginWithToken(result.token);
				navigate("/", { replace: true, state: { welcome: true } });
			} catch {
				setSubmitting(false);
				setServerError(
					"Votre compte est créé, mais la connexion a échoué. Connectez-vous avec Google.",
				);
			}
			return;
		}

		setSubmitting(false);
		if (result.status === "invalid") {
			setFieldErrors(result.errors);
			return;
		}
		if (result.status === "conflict") {
			if (result.field) {
				setFieldErrors({ [result.field]: result.message });
			} else {
				setServerError(result.message);
			}
			return;
		}
		setServerError(
			result.status === "expired"
				? result.message
				: "Une erreur est survenue. Veuillez réessayer plus tard.",
		);
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setServerError(null);

		const pseudo = pseudoRef.current?.value.trim() ?? "";
		const email = emailRef.current?.value.trim() ?? "";

		const errors: RegisterFieldError = {};

		const pseudoError = getPseudoError(pseudo);
		if (pseudoError != null) {
			errors.pseudo = pseudoError;
		}

		if (pendingToken == null) {
			if (email === "") {
				errors.email = "Vous devez saisir une adresse email";
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				errors.email = "Vous devez saisir une adresse email valide";
			}

			if (password === "") {
				errors.password = "Vous devez saisir un mot de passe";
			} else if (password.length < 8) {
				errors.password =
					"Votre mot de passe doit faire au moins 8 caractères";
			} else if (password.length > 128) {
				errors.password =
					"Votre mot de passe ne peut pas dépasser 128 caractères";
			} else if (
				!/[A-Z]/.test(password) ||
				!/[0-9]/.test(password) ||
				!/[^A-Za-z0-9]/.test(password)
			) {
				errors.password =
					"Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial";
			} else if (password !== confirmPassword) {
				errors.password = "Les deux mots de passe doivent correspondre";
			}
		}

		if (cguAccepted === false) {
			errors.cgu =
				"Vous devez accepter les conditions générales d'utilisation";
		}

		if (!manualMode && addressServiceUnavailable === true) {
			errors.address = "Le service d'adresse est indisponible";
		} else if (!manualMode && selectedAddress == null) {
			errors.address = "Veuillez sélectionner une adresse.";
		} else if (
			manualMode &&
			(city.trim() === "" || postalCode.trim() === "")
		) {
			errors.address = "Veuillez renseigner la ville et le code postal.";
		}

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}

		setFieldErrors({});

		const address = manualMode
			? { city: city.trim(), postalCode: postalCode.trim() }
			: selectedAddress
				? {
						city: selectedAddress.city,
						postalCode: selectedAddress.postalCode,
						inseeCode: selectedAddress.inseeCode,
						latitude: selectedAddress.latitude,
						longitude: selectedAddress.longitude,
						streetLine: selectedAddress.streetLine,
						isApproximate: selectedAddress.type !== "housenumber",
					}
				: { city: city.trim(), postalCode: postalCode.trim() };

		setSubmitting(true);
		if (pendingToken != null) {
			await submitGoogleSignup(pendingToken, pseudo, address);
			return;
		}

		const result = await register({
			pseudo,
			email,
			password,
			cguAccepted,
			address,
		});
		setSubmitting(false);

		if (result.status === "ok") {
			navigate("/login", { state: { justRegistered: true } });
			return;
		}
		if (result.status === "invalid") {
			setFieldErrors(result.errors);
			return;
		}
		if (result.status === "conflict") {
			if (result.field) {
				setFieldErrors({ [result.field]: result.message });
			} else {
				setServerError(result.message);
			}
			return;
		}
		if (result.status === "tooManyRequests") {
			setPassword("");
			setConfirmPassword("");
			setServerError(result.message);
			return;
		}
		setPassword("");
		setConfirmPassword("");
		setServerError(
			"Une erreur est survenue. Veuillez réessayer plus tard.",
		);
	}

	return {
		pseudoRef,
		emailRef,
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		showPassword,
		setShowPassword,
		cguAccepted,
		setCguAccepted,
		fieldErrors,
		submitting,
		serverError,
		handleSubmit,
	};
}
