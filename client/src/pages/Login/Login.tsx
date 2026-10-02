import backgroundIncident from "@/assets/images/background-incident.jpg";
import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

type FieldErrors = {
	identifier?: string;
	password?: string;
};

const fieldBase =
	"relative flex items-center rounded-2xl border px-4 py-3.5 transition-colors";
const fieldNeutral = "border-primary/60 bg-base-300";
const fieldError = "border-error bg-error/10";

export default function Login() {
	const { user, loading, login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const justRegistered =
		(location.state as { justRegistered?: boolean })?.justRegistered ===
		true;

	useEffect(() => {
		if (!loading && user != null) {
			const from =
				(location.state as { from?: Location })?.from?.pathname ?? "/";
			navigate(from, { replace: true });
		}
	}, [loading, user, location, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors: FieldErrors = {};
		if (!identifier.trim()) errors.identifier = "Identifiant requis.";
		if (!password) errors.password = "Mot de passe requis.";
		setFieldErrors(errors);
		if (Object.keys(errors).length > 0) return;

		if (submitting) return;
		setSubmitting(true);
		setServerError(null);

		try {
			await login(identifier, password);
		} catch (err) {
			setPassword("");
			if (err instanceof TypeError) {
				setServerError(
					"Impossible de contacter le serveur. Vérifiez votre connexion.",
				);
			} else {
				setServerError(
					err instanceof Error
						? err.message
						: "Connexion impossible.",
				);
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="min-h-full bg-base-100 pb-10">
			<header className="relative isolate overflow-hidden bg-primary px-4 pt-8 pb-14">
				<img
					src={backgroundIncident}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 mix-blend-multiply"
				/>
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="btn btn-square btn-md rounded-xl border-2 border-accent bg-secondary/90 shadow-none hover:bg-accent"
						aria-label="Retour à la page précédente"
						onClick={() => navigate(-1)}
					>
						<Icon
							name="arrowSmallLeft"
							className="h-4 w-4 fill-accent"
							aria-hidden="true"
						/>
					</button>
					<h1 className="font-title text-2xl font-bold text-accent">
						Se connecter
					</h1>
				</div>
				<p className="mt-2 text-center text-sm font-semibold text-white/90">
					Retrouvez votre quartier et vos signalements en un instant.
				</p>
			</header>

			<div className="relative mx-4 -mt-8 rounded-3xl bg-base-200 px-5 pt-6 pb-8">
				{justRegistered && (
					<p className="mb-5 rounded-2xl bg-(--bg-success) px-4 py-3 text-sm font-semibold text-primary">
						Votre compte a bien été créé. Connectez-vous pour
						continuer. Pensez à vérifier votre e-mail pour débloquer
						toutes les fonctionnalités.
					</p>
				)}
				<form
					onSubmit={handleSubmit}
					noValidate
					className="flex flex-col gap-5"
				>
					<div className="w-full">
						<label
							htmlFor="login-identifier"
							className="mb-2 block text-base text-primary"
						>
							E-mail ou pseudo
						</label>
						<div
							className={`${fieldBase} ${
								fieldErrors.identifier
									? fieldError
									: fieldNeutral
							}`}
						>
							<input
								id="login-identifier"
								type="text"
								autoComplete="username"
								placeholder="marion.c@exemple.fr"
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
								aria-invalid={fieldErrors.identifier != null}
								aria-describedby={
									fieldErrors.identifier
										? "login-identifier-message"
										: undefined
								}
								className="w-full bg-transparent pr-8 text-black placeholder:text-black/60 focus:outline-none"
							/>
							<Icon
								name="exclamation"
								className={`${
									fieldErrors.identifier ? "" : "invisible"
								} absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 fill-error`}
								aria-hidden="true"
							/>
						</div>
						{fieldErrors.identifier && (
							<p
								id="login-identifier-message"
								className="mt-1.5 text-xs font-semibold text-error"
							>
								{fieldErrors.identifier}
							</p>
						)}
					</div>

					<div className="w-full">
						<label
							htmlFor="login-password"
							className="mb-2 block text-base text-primary"
						>
							Mot de passe
						</label>
						<div
							className={`${fieldBase} ${
								fieldErrors.password ? fieldError : fieldNeutral
							}`}
						>
							<input
								id="login-password"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								placeholder="…"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								aria-invalid={fieldErrors.password != null}
								aria-describedby={
									fieldErrors.password
										? "login-password-message"
										: undefined
								}
								className="w-full bg-transparent pr-2 text-black placeholder:text-black/60 focus:outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								className="shrink-0 text-sm font-bold text-primary underline"
							>
								{showPassword ? "Masquer" : "Afficher"}
							</button>
						</div>
						{fieldErrors.password && (
							<p
								id="login-password-message"
								className="mt-1.5 text-xs font-semibold text-error"
							>
								{fieldErrors.password}
							</p>
						)}
					</div>

					<div aria-live="polite">
						{serverError && (
							<p className="text-xs font-semibold text-error">
								{serverError}
							</p>
						)}
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="btn btn-accent btn-md w-full rounded-full border-none font-bold disabled:opacity-60"
					>
						{submitting ? "Connexion..." : "Se connecter"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-primary/80">
					Pas encore de compte ?{" "}
					<Link
						to="/register"
						className="font-bold text-primary underline"
					>
						S'inscrire
					</Link>
				</p>
			</div>
		</main>
	);
}
