import FormInput from "@/components/Form/FormInput/FormInput";
import { useAuth } from "@/contexts/auth/AuthContext";
import { deleteAccount } from "@/services/userService";
import { type RefObject, useRef, useState } from "react";
import { useNavigate } from "react-router";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
};

const DELETED_ITEMS = [
	"Vos adresses et votre position",
	"Vos confirmations et infirmations de signalements",
	"Vos badges et vos notifications",
	"La liaison avec votre compte Google, le cas échéant",
	"Votre pseudo, votre adresse e-mail et votre mot de passe : vous ne pourrez plus vous connecter",
];

const KEPT_ITEMS = [
	"Vos signalements",
	"Vos commentaires",
	"Ils restent visibles pour vos voisins, sans qu'on puisse vous identifier.",
];

export default function DeleteAccountDialog({ dialogRef }: Props) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Un compte créé via Google n'a pas de mot de passe : on demande le pseudo
	const needsPassword = user?.hasPassword ?? true;
	const confirmationLabel = needsPassword
		? "Mot de passe"
		: "Saisissez votre pseudo pour confirmer";

	const handleClose = () => {
		setValue("");
		setError(null);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting) return;

		if (value.trim() === "") {
			setError(
				needsPassword
					? "Vous devez saisir votre mot de passe"
					: "Vous devez saisir votre pseudo",
			);
			inputRef.current?.focus();
			return;
		}

		setError(null);
		setIsSubmitting(true);
		const result = await deleteAccount(
			needsPassword ? { password: value } : { pseudo: value.trim() },
		);
		setIsSubmitting(false);

		if (result.status === "ok") {
			dialogRef.current?.close();
			logout();
			navigate("/", { replace: true, state: { accountDeleted: true } });
			return;
		}

		// La saisie est conservée pour pouvoir réessayer
		setError(
			result.status === "invalid"
				? result.message
				: "Une erreur est survenue. Vérifiez votre connexion puis réessayez. Votre compte n'a pas été supprimé.",
		);
		inputRef.current?.focus();
	};

	return (
		<dialog
			ref={dialogRef}
			onClose={handleClose}
			onCancel={(event) => {
				// Échap pendant l'envoi : la requête est déjà partie
				if (isSubmitting) event.preventDefault();
			}}
			className="modal modal-bottom sm:modal-middle"
			aria-labelledby="delete-account-dialog-title"
			aria-describedby="delete-account-dialog-warning"
		>
			<div className="modal-box rounded-t-3xl bg-base-200 sm:rounded-3xl">
				<h2
					id="delete-account-dialog-title"
					className="font-title text-xl font-bold text-primary"
				>
					Supprimer mon compte
				</h2>
				<p
					id="delete-account-dialog-warning"
					className="mt-3 text-sm font-bold text-(--error-text)"
				>
					Cette action est irréversible : une fois votre compte
					supprimé, il est impossible de le récupérer.
				</p>

				<h3 className="mt-5 text-xs font-bold uppercase tracking-widest text-primary/75">
					Ce qui sera supprimé
				</h3>
				<ul className="mt-2 list-disc pl-5 text-sm text-primary">
					{DELETED_ITEMS.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>

				<h3 className="mt-5 text-xs font-bold uppercase tracking-widest text-primary/75">
					Ce qui sera conservé de façon anonyme
				</h3>
				<ul className="mt-2 list-disc pl-5 text-sm text-primary">
					{KEPT_ITEMS.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>

				<form
					onSubmit={handleSubmit}
					noValidate
					aria-busy={isSubmitting}
					className="mt-6 flex flex-col gap-3"
				>
					<label
						htmlFor="delete-account-confirmation"
						className="text-primary"
					>
						{confirmationLabel}
					</label>
					<FormInput
						id="delete-account-confirmation"
						ref={inputRef}
						type={needsPassword ? "password" : "text"}
						autoComplete={
							needsPassword ? "current-password" : "off"
						}
						value={value}
						onChange={(event) => setValue(event.target.value)}
						aria-invalid={error != null}
						aria-describedby={
							error != null
								? "delete-account-confirmation-error"
								: undefined
						}
					/>
					{error != null && (
						<p
							id="delete-account-confirmation-error"
							role="alert"
							className="text-xs font-semibold text-error"
						>
							{error}
						</p>
					)}
					<div className="mt-3 flex gap-3">
						<button
							type="button"
							onClick={() => dialogRef.current?.close()}
							disabled={isSubmitting}
							className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="btn btn-error btn-md basis-2/3 grow rounded-full border-none font-bold text-(--on-error)"
						>
							{isSubmitting
								? "Suppression en cours..."
								: "Supprimer définitivement"}
						</button>
					</div>
				</form>
			</div>
			{!isSubmitting && (
				<form method="dialog" className="modal-backdrop">
					<button type="submit">Fermer</button>
				</form>
			)}
		</dialog>
	);
}
