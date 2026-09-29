import bgHome from "@/assets/images/background-home.jpg";
import Icon from "@/components/Icon/Icon";
import PasswordStrengthMeter from "@/components/Register/PasswordStrengthMeter/PasswordStrengthMeter";
import SubmitRegister from "@/components/Register/SubmitRegister/SubmitRegister";
import { register } from "@/services/userService";
import type { RegisterFieldError } from "@/types/register";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import useAddressSearch from "./useAddressSearch";
import usePasswordStrength from "./usePasswordStrength";

export default function Register() {
	const navigate = useNavigate();

	const pseudoRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);

	const [password, setPassword] = useState("");
	const { score, label } = usePasswordStrength(password);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [cguAccepted, setCguAccepted] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<RegisterFieldError>({});
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		addressQuery,
		setAddressQuery,
		addressSuggestions,
		selectedAddress,
		selectSuggestion,
		highlightedIndex,
		setHighlightedIndex,
		addressServiceUnavailable,
		manualMode,
		setManualMode,
		city,
		setCity,
		postalCode,
		setPostalCode,
	} = useAddressSearch();

	const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (addressSuggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightedIndex(
				(prev) => (prev + 1) % addressSuggestions.length,
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightedIndex((prev) =>
				prev <= 0 ? addressSuggestions.length - 1 : prev - 1,
			);
		} else if (e.key === "Enter" && highlightedIndex >= 0) {
			e.preventDefault();
			selectSuggestion(addressSuggestions[highlightedIndex]);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const pseudo = pseudoRef.current?.value.trim() ?? "";
		const email = emailRef.current?.value.trim() ?? "";

		const errors: RegisterFieldError = {};

		if (pseudo === "") {
			errors.pseudo = "Vous devez renseigner un pseudo";
		} else if (pseudo.includes("@")) {
			errors.pseudo = "Votre pseudo ne peut pas contenir de @";
		}

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

		if (addressServiceUnavailable === true) {
			errors.address = "Le service d'adresse est indisponible";
		}

		if (cguAccepted === false) {
			errors.cgu =
				"Vous devez accepter les conditions générales d'utilisation";
		}

		if (!manualMode && selectedAddress == null) {
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

		const address = selectedAddress
			? {
					city: selectedAddress.city,
					postalCode: selectedAddress.postalCode,
					inseeCode: selectedAddress.inseeCode,
					latitude: selectedAddress.latitude,
					longitude: selectedAddress.longitude,
				}
			: { city: city.trim(), postalCode: postalCode.trim() };

		setSubmitting(true);
		const result = await register({
			pseudo,
			email,
			password,
			cguAccepted,
			address,
		});
		setSubmitting(false);

		if (result.status === "ok") {
			navigate("/");
			return;
		}
		if (result.status === "invalid") {
			setFieldErrors(result.errors);
			return;
		}
		if (result.status === "conflict") {
			setFieldErrors({ [result.field]: result.message });
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
	};
	return (
		<div className="min-h-screen bg-base-100">
			<header className="relative isolate flex h-44 flex-col shrink-0 justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src={bgHome}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<div className="flex items-center gap-3 ">
					<button
						type="button"
						className="btn btn-square btn-md rounded-xl border-2 border-accent bg-accent/20 shadow-none hover:bg-white/50"
						aria-label="Retour à la carte"
						onClick={() => navigate("/")}
					>
						<Icon
							name="arrowSmallLeft"
							className="h-4 w-4 fill-accent"
							aria-hidden="true"
						/>
					</button>
					<h1 className="font-title text-2xl font-bold text-accent">
						Créer mon compte
					</h1>
				</div>
				<p className="mt-1 text-sm text-center text-white/85">
					Un compte et une adresse suffisent pour être alerté et pour
					signaler ce que vous voyez.
				</p>
			</header>

			<form
				onSubmit={handleSubmit}
				className="relative -mt-8 space-y-4 px-4 pb-6"
			>
				<section className="rounded-2xl bg-base-200 p-4">
					<div className="space-y-4 px-4">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="register-pseudo"
								className="text-primary"
							>
								Pseudonyme
							</label>
							<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
								<input
									id="register-pseudo"
									ref={pseudoRef}
									type="text"
									placeholder="Votre pseudo"
									className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none"
									aria-describedby={
										fieldErrors.pseudo
											? "register-pseudo-error"
											: undefined
									}
								/>
							</section>
							<p className="text-xs text-primary">
								Visible par vos voisins sur vos signalements.
							</p>
							{fieldErrors.pseudo && (
								<p
									id="register-pseudo-error"
									className="text-xs font-semibold text-error"
								>
									{fieldErrors.pseudo}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="register-email"
								className="text-primary"
							>
								E-mail
							</label>
							<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
								<input
									id="register-email"
									ref={emailRef}
									type="text"
									placeholder="marion.c@exemple.fr"
									className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none"
									aria-describedby={
										fieldErrors.email
											? "register-email-error"
											: undefined
									}
								/>
							</section>
							{fieldErrors.email && (
								<p
									id="register-email-error"
									className="text-xs font-semibold text-error"
								>
									{fieldErrors.email}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="register-password"
								className="text-primary"
							>
								Mot de passe
							</label>
							<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
								<div className="flex items-center justify-between gap-2">
									<input
										id="register-password"
										type={
											showPassword ? "text" : "password"
										}
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										placeholder="..."
										className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none"
										aria-describedby={
											fieldErrors.password
												? "register-password-error"
												: undefined
										}
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword((prev) => !prev)
										}
										className="shrink-0 text-sm font-bold text-primary underline"
									>
										{showPassword ? "Masquer" : "Afficher"}
									</button>
								</div>
							</section>
							{password.length > 0 && (
								<PasswordStrengthMeter
									score={score}
									label={label}
								/>
							)}
							{fieldErrors.password && (
								<p
									id="register-password-error"
									className="text-xs font-semibold text-error"
								>
									{fieldErrors.password}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="register-confirm-password"
								className="text-primary"
							>
								Confirmer le mot de passe
							</label>
							<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
								<div className="flex items-center justify-between gap-2">
									<input
										id="register-confirm-password"
										type={
											showPassword ? "text" : "password"
										}
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										placeholder="..."
										className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none"
									/>
									{confirmPassword.length > 0 && (
										<Icon
											name={
												password === confirmPassword
													? "check"
													: "crossSmall"
											}
											className={`h-4 w-4 shrink-0 ${
												password === confirmPassword
													? "fill-success"
													: "fill-error"
											}`}
											aria-hidden="true"
										/>
									)}
								</div>
							</section>
						</div>
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center justify-between">
								<label
									htmlFor="register-address"
									className="text-primary"
								>
									Votre adresse
								</label>
								{manualMode && (
									<button
										type="button"
										onClick={() => setManualMode(false)}
										aria-label="Revenir à la recherche d'adresse"
										className="btn btn-square btn-sm rounded-xl border-2 border-primary/15 bg-transparent shadow-none hover:bg-primary/10"
									>
										<Icon
											name="arrowSmallLeft"
											className="h-4 w-4 fill-primary"
											aria-hidden="true"
										/>
									</button>
								)}
							</div>
							{!manualMode && (
								<div className="relative">
									<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
										<input
											id="register-address"
											value={addressQuery}
											onChange={(e) =>
												setAddressQuery(e.target.value)
											}
											onKeyDown={handleAddressKeyDown}
											type="text"
											placeholder="12 allée de l'exemple, 15800 Polminhac"
											className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none"
											autoComplete="off"
											aria-describedby={
												fieldErrors.address
													? "register-address-error"
													: undefined
											}
										/>
									</section>
									{addressSuggestions.length > 0 && (
										<div className="absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-1 rounded-2xl border border-primary/15 bg-base-300 p-2 shadow-lg">
											{addressSuggestions.map(
												(suggestion, index) => (
													<button
														key={suggestion.name}
														type="button"
														onClick={() =>
															selectSuggestion(
																suggestion,
															)
														}
														onMouseEnter={() =>
															setHighlightedIndex(
																index,
															)
														}
														className={`rounded-xl p-3 text-left ${
															index ===
															highlightedIndex
																? "bg-primary/10"
																: ""
														}`}
													>
														<span className="block font-bold text-primary">
															{suggestion.name}
														</span>
														<span className="block text-sm text-primary/70">
															{
																suggestion.postalCode
															}
														</span>
													</button>
												),
											)}
										</div>
									)}
								</div>
							)}
							{manualMode && (
								<div className="flex flex-col gap-2">
									<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
										<input
											id="register-city"
											value={city}
											onChange={(e) =>
												setCity(e.target.value)
											}
											type="text"
											placeholder="Ville"
											className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none"
											aria-describedby={
												fieldErrors.address
													? "register-address-error"
													: undefined
											}
										/>
									</section>
									<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
										<input
											id="register-postal-code"
											value={postalCode}
											onChange={(e) =>
												setPostalCode(e.target.value)
											}
											type="text"
											placeholder="Code postal"
											className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none"
											aria-describedby={
												fieldErrors.address
													? "register-address-error"
													: undefined
											}
										/>
									</section>
								</div>
							)}
							{!manualMode && (
								<button
									type="button"
									onClick={() => setManualMode(true)}
									className="self-start text-sm font-bold text-primary underline"
								>
									Je ne trouve pas mon adresse
								</button>
							)}
							<p className="text-xs text-primary">
								Elle définit la zone où vous serez alerté.
								Enregistrée comme votre adresse principale.
							</p>
							{fieldErrors.address && (
								<p
									id="register-address-error"
									className="text-xs font-semibold text-error"
								>
									{fieldErrors.address}
								</p>
							)}
						</div>

						<div className="flex items-start gap-3">
							<input
								id="register-cgu"
								type="checkbox"
								checked={cguAccepted}
								onChange={(e) =>
									setCguAccepted(e.target.checked)
								}
								className="checkbox checkbox-accent mt-0.5"
								style={
									{
										"--radius-selector": "0.25rem",
									} as React.CSSProperties
								}
								aria-describedby={
									fieldErrors.cgu
										? "register-cgu-error"
										: undefined
								}
							/>
							<label
								htmlFor="register-cgu"
								className="text-sm text-primary"
							>
								J'accepte les{" "}
								<Link to="/cgu" className="font-bold underline">
									conditions générales
								</Link>{" "}
								et la politique de confidentialité.
							</label>
						</div>
						{fieldErrors.cgu && (
							<p
								id="register-cgu-error"
								className="text-xs font-semibold text-error"
							>
								{fieldErrors.cgu}
							</p>
						)}
					</div>
				</section>
				<section className="text-center">
					<div aria-live="polite">
						{serverError && (
							<p className="mb-3 text-sm font-semibold text-error">
								{serverError}
							</p>
						)}
					</div>
					<SubmitRegister submitting={submitting} />
					<p className="mt-3 text-sm text-primary">
						Déjà inscrit ?{" "}
						<Link to="/login" className="font-bold underline">
							Se connecter
						</Link>
					</p>
				</section>
			</form>
		</div>
	);
}
