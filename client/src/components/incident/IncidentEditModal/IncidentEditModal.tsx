import Icon from "@/components/Icon/Icon";
import { useState } from "react";
import type { RefObject } from "react";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
	title: string;
	description: string | null;
	photoUrl: string | null;
};

export default function IncidentEditModal({
	dialogRef,
	title,
	description,
	photoUrl,
}: Props) {
	const [titleValue, setTitleValue] = useState(title);
	const [descriptionValue, setDescriptionValue] = useState(description ?? "");
	const [photoUrlValue, setPhotoUrlValue] = useState(photoUrl);

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
						Le type, la gravité et la position ne peuvent pas être
						modifiés : ils définissent qui a été alerté, dans quel
						rayon et pour combien de temps.
					</p>
				</div>

				<form method="dialog">
					<div className="mt-5 flex flex-col gap-1.5">
						<div className="flex items-center justify-between gap-2">
							<label
								htmlFor="incident-edit-title"
								className="mb-1.5 block text-sm font-bold text-primary"
							>
								Titre
							</label>
							<span className="text-xs text-primary/40">
								{titleValue.length} / 150 caractères
							</span>
						</div>
						<input
							id="incident-edit-title"
							type="text"
							value={titleValue}
							placeholder="Ajouter un titre (facultatif)"
							onChange={(e) => setTitleValue(e.target.value)}
							maxLength={150}
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
								{descriptionValue.length} / 1000 caractères
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
							maxLength={1000}
							className="w-full resize-none rounded-xl border-2 border-primary/15 bg-base-300 px-5 py-4 text-black placeholder:text-black/40 focus:outline-none"
						/>
					</div>

					<div className="mt-4 flex flex-col gap-1.5 mb-5">
						<p className="mb-1.5 block text-sm font-bold text-primary">
							Photo
						</p>
						{photoUrlValue ? (
							<div className="relative overflow-hidden rounded-xl">
								<img
									src={photoUrlValue}
									alt="Aperçu actuel du signalement"
									className="w-full object-cover"
								/>
								<div className="absolute top-2 right-2 flex gap-2">
									<button
										type="button"
										className="btn btn-square btn-sm rounded-xl border-none bg-black/40 shadow-none hover:bg-black/60"
										aria-label="Remplacer la photo"
									>
										<Icon
											name="pencil"
											className="h-3 w-3 fill-white"
											aria-hidden="true"
										/>
									</button>
									<button
										type="button"
										onClick={() => setPhotoUrlValue(null)}
										className="btn btn-square btn-sm rounded-xl border-none bg-black/40 shadow-none hover:bg-black/60"
										aria-label="Supprimer la photo"
									>
										<Icon
											name="crossSmall"
											className="h-5 w-5 fill-white"
											aria-hidden="true"
										/>
									</button>
								</div>
							</div>
						) : (
							<button
								type="button"
								className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/20 bg-transparent py-6 text-sm font-bold text-primary/60 hover:bg-primary/5"
							>
								<Icon
									name="camera"
									className="h-5 w-5 fill-primary/40"
									aria-hidden="true"
								/>
								Ajouter une photo
							</button>
						)}
					</div>
					<div className="flex gap-3 w-full border-t border-primary/10 pt-5">
						<button
							type="submit"
							className="btn btn-accent btn-md basis-2/3 grow rounded-full border-none px-5 font-bold"
							aria-label="Enregistrer"
						>
							Enregistrer
						</button>
						<button
							type="submit"
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
