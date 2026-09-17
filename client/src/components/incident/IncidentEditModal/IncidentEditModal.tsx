import Icon from "@/components/Icon/Icon";
import PhotoField from "@/components/Form/PhotoField/PhotoField";
import { updateIncident } from "@/services/incidentService";
import type { Incident } from "@/types/incidentDetails";
import { type FormEvent, type RefObject, useState } from "react";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
	id: number;
	title: string;
	description: string | null;
	photoUrl: string | null;
	onSaved: (incident: Incident) => void;
};

export default function IncidentEditModal({
	dialogRef,
	id,
	title,
	description,
	photoUrl,
	onSaved,
}: Props) {
	const [titleValue, setTitleValue] = useState(title);
	const [descriptionValue, setDescriptionValue] = useState(description ?? "");
	const [photoUrlValue, setPhotoUrlValue] = useState(photoUrl);
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setServerError(null);

		const result = await updateIncident(String(id), {
			title: titleValue,
			description: descriptionValue,
			photoUrl: photoUrlValue,
		});

		setSubmitting(false);

		if (result.status === "ok") {
			onSaved(result.incident);
			return;
		}

		if (result.status === "invalid") {
			setServerError(
				"Le titre est obligatoire et les champs ont une longueur maximale : vérifiez votre saisie.",
			);
			return;
		}

		if (result.status === "notFound") {
			setServerError("Ce signalement n'existe plus.");
			return;
		}

		setServerError(
			"La connexion au serveur a échoué. Vos modifications sont conservées, vous pouvez réessayer.",
		);
	}

	return (
		<dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
			<div className="modal-box rounded-t-3xl bg-base-200 sm:rounded-3xl">
				<div className="flex items-center justify-between gap-2">
					<h2 className="font-title text-xl font-bold text-primary">
						Corriger mon signalement
					</h2>
					<form method="dialog">
						<button
							type="submit"
							className="btn btn-square btn-md rounded-xl border-2 border-primary/15 bg-transparent shadow-none hover:bg-primary/10"
							aria-label="Fermer"
						>
							<Icon
								name="crossSmall"
								className="h-4 w-4 fill-primary"
								aria-hidden="true"
							/>
						</button>
					</form>
				</div>
				<div className="flex w-full items-start gap-3 rounded-2xl bg-(--primary-light) px-5 py-3 mt-5">
					<Icon
						name="info"
						className="h-6 w-6 shrink-0 fill-success"
						aria-hidden="true"
					/>
					<p className="text-sm text-primary">
						Les types, le niveau de gravité et le lieu ne peuvent
						pas être modifiés.
					</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="mt-5 flex flex-col gap-1.5">
						<div className="flex items-center justify-between gap-2">
							<label
								htmlFor="incident-edit-title"
								className="mb-1.5 block text-sm font-bold text-primary"
							>
								Titre
							</label>
							<span className="text-xs text-primary/40">
								{titleValue.length} / 80 caractères
							</span>
						</div>
						<input
							id="incident-edit-title"
							type="text"
							value={titleValue}
							placeholder="Ajouter un titre"
							onChange={(e) => setTitleValue(e.target.value)}
							maxLength={80}
							className="w-full rounded-xl border-2 border-primary/15 bg-base-300 px-4 py-3 pr-8 text-black placeholder:text-black/40 focus:outline-none"
						/>
					</div>

					<div className="mt-4 flex flex-col gap-1.5">
						<div className="flex items-center justify-between gap-2">
							<label
								htmlFor="incident-edit-description"
								className="mb-1.5 block text-sm font-bold text-primary"
							>
								Description
							</label>
							<span className="text-xs text-primary/40">
								{descriptionValue.length} / 500 caractères
							</span>
						</div>
						<textarea
							id="incident-edit-description"
							rows={4}
							value={descriptionValue}
							placeholder="Ajouter une description (facultatif)"
							onChange={(e) =>
								setDescriptionValue(e.target.value)
							}
							maxLength={500}
							className="w-full resize-none rounded-xl border-2 border-primary/15 bg-base-300 px-5 py-4 text-black placeholder:text-black/40 focus:outline-none"
						/>
					</div>

					<PhotoField
						value={photoUrlValue}
						onChange={setPhotoUrlValue}
					/>

					{serverError != null && (
						<div
							role="alert"
							className="mb-3 flex w-full items-start gap-3 rounded-2xl bg-(--bg-error) px-5 py-3"
						>
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error">
								<Icon
									name="exclamation"
									className="h-3.5 w-3.5 fill-white"
									aria-hidden="true"
								/>
							</span>
							<p className="text-sm text-error">{serverError}</p>
						</div>
					)}

					<div className="flex gap-3 w-full border-t border-primary/10 pt-5">
						<button
							type="submit"
							disabled={submitting}
							className="btn btn-accent btn-md basis-2/3 grow rounded-full border-none px-5 font-bold disabled:opacity-60"
							aria-label="Enregistrer"
						>
							{submitting ? "Enregistrement..." : "Enregistrer"}
						</button>
						<button
							type="button"
							onClick={() => dialogRef.current?.close()}
							className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
							aria-label="Annuler"
						>
							Annuler
						</button>
					</div>
				</form>
			</div>

			<form method="dialog" className="modal-backdrop">
				<button type="submit">Fermer</button>
			</form>
		</dialog>
	);
}
