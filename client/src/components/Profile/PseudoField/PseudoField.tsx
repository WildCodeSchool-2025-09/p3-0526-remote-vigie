import FormInput from "@/components/Form/FormInput/FormInput";
import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/auth/AuthContext";
import { updatePseudo } from "@/services/userService";
import getPseudoError from "@/utils/getPseudoError";
import { useEffect, useRef, useState } from "react";

type PseudoFieldProps = {
	pseudo: string;
};

export default function PseudoField({ pseudo }: PseudoFieldProps) {
	const { updateUser } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(pseudo);
	const [error, setError] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const editButtonRef = useRef<HTMLButtonElement>(null);
	const hasEdited = useRef(false);

	// Le bouton « Modifier » et le champ ne sont jamais montés ensemble : on
	// déplace le focus à chaque bascule, sinon il se perd pour le clavier.
	useEffect(() => {
		if (isEditing) {
			hasEdited.current = true;
			inputRef.current?.focus();
		} else if (hasEdited.current) {
			editButtonRef.current?.focus();
		}
	}, [isEditing]);

	const startEditing = () => {
		setDraft(pseudo);
		setError(null);
		setConfirmation(null);
		setIsEditing(true);
	};

	const cancelEditing = () => {
		setError(null);
		setIsEditing(false);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting) return;

		const validationError = getPseudoError(draft);
		if (validationError != null) {
			setError(validationError);
			inputRef.current?.focus();
			return;
		}

		const trimmed = draft.trim();

		// Même règle que le serveur : la casse seule ne compte pas comme un changement
		if (trimmed.toLowerCase() === pseudo.toLowerCase()) {
			setError(null);
			setConfirmation("Votre pseudo est inchangé.");
			setIsEditing(false);
			return;
		}

		setError(null);
		setIsSubmitting(true);
		const result = await updatePseudo(trimmed);
		setIsSubmitting(false);

		if (result.status === "ok") {
			updateUser(result.user);
			setConfirmation("Votre pseudo a bien été modifié.");
			setIsEditing(false);
			return;
		}

		// La saisie est conservée pour pouvoir réessayer
		setError(
			result.status === "error"
				? "Une erreur est survenue. Vérifiez votre connexion puis réessayez."
				: result.message,
		);
		inputRef.current?.focus();
	};

	if (!isEditing) {
		return (
			<div className="border-b border-dashed border-primary/15 py-3">
				<dt className="text-xs uppercase tracking-widest text-primary/75">
					Pseudo
				</dt>
				<dd className="mt-1 text-base font-bold text-primary">
					<div className="flex items-center justify-between gap-2">
						<span className="min-w-0 wrap-anywhere">{pseudo}</span>
						<button
							type="button"
							ref={editButtonRef}
							onClick={startEditing}
							className="btn btn-ghost btn-sm shrink-0 text-primary"
						>
							<Icon
								name="pencil"
								className="h-4 w-4 fill-primary"
								aria-hidden="true"
							/>
							<span className="sr-only">Modifier mon pseudo</span>
						</button>
					</div>
					<output className="block text-xs font-semibold text-success">
						{confirmation}
					</output>
				</dd>
			</div>
		);
	}

	return (
		<div className="border-b border-dashed border-primary/15 py-3">
			<dt className="text-xs uppercase tracking-widest text-primary/75">
				<label htmlFor="profile-pseudo">Pseudo</label>
			</dt>
			<dd className="mt-1">
				<form
					onSubmit={handleSubmit}
					onKeyDown={(event) => {
						if (event.key === "Escape" && !isSubmitting)
							cancelEditing();
					}}
					aria-busy={isSubmitting}
					noValidate
					className="flex flex-col gap-3"
				>
					<FormInput
						id="profile-pseudo"
						ref={inputRef}
						type="text"
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						aria-invalid={error != null}
						aria-describedby={
							error != null ? "profile-pseudo-error" : undefined
						}
					/>
					{error != null && (
						<p
							id="profile-pseudo-error"
							role="alert"
							className="text-xs font-semibold text-error"
						>
							{error}
						</p>
					)}
					<div className="flex gap-2">
						<button
							type="button"
							onClick={cancelEditing}
							disabled={isSubmitting}
							className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="btn btn-accent btn-md grow rounded-full border-none font-bold"
						>
							{isSubmitting ? "Enregistrement…" : "Enregistrer"}
						</button>
					</div>
				</form>
			</dd>
		</div>
	);
}
