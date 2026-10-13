import Icon from "@/components/Icon/Icon";
import { resolvePhotoUrl } from "@/utils/photoUrl";
import { PhotoResizeError, resizePhoto } from "@/utils/resizePhoto";
import { type ChangeEvent, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Garde-fou du navigateur, pas la limite de 5 Mo : une photo de téléphone
// dépasse souvent 5 Mo mais est ramenée à ~300 Ko avant l'envoi.
const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;

type Props = {
	// Data URL de la photo choisie (déjà redimensionnée), null = aucune photo.
	// undefined (édition) = on garde la photo actuelle, `existingUrl`.
	value: string | null | undefined;
	existingUrl?: string | null;
	onChange: (value: string | null | undefined) => void;
	onProcessingChange?: (processing: boolean) => void;
};

export default function PhotoField({
	value,
	existingUrl = null,
	onChange,
	onProcessingChange,
}: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);

	const shown = value === undefined ? existingUrl : value;
	// Une photo vient d'être choisie alors qu'une photo existe déjà : la retirer
	// ramène d'abord à la photo existante, la supprimer demande un second clic.
	const revertsToExisting = typeof value === "string" && existingUrl != null;

	async function handleFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		// Permet de rechoisir le même fichier après un retrait.
		event.target.value = "";
		if (file == null) return;

		setError(null);

		if (!ACCEPTED_TYPES.includes(file.type)) {
			setError("Seuls les formats JPEG, PNG et WebP sont acceptés.");
			return;
		}

		if (file.size > MAX_ORIGINAL_BYTES) {
			setError("Cette photo est trop volumineuse (20 Mo maximum).");
			return;
		}

		setProcessing(true);
		onProcessingChange?.(true);

		try {
			onChange(await resizePhoto(file));
		} catch (err) {
			// Jamais d'envoi du fichier d'origine : il pourrait garder son EXIF (GPS).
			setError(
				err instanceof PhotoResizeError
					? "Cette photo n'a pas pu être traitée. Choisissez-en une autre ou continuez sans photo."
					: "Une erreur est survenue avec cette photo. Choisissez-en une autre ou continuez sans photo.",
			);
		} finally {
			setProcessing(false);
			onProcessingChange?.(false);
		}
	}

	function handleRemove() {
		setError(null);
		onChange(revertsToExisting ? undefined : null);
	}

	return (
		<div className="mt-4 flex flex-col gap-1.5 mb-5">
			<p className="mb-1.5 block text-sm font-bold text-primary">Photo</p>
			<input
				ref={inputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				onChange={handleFile}
				className="hidden"
				tabIndex={-1}
				aria-hidden="true"
			/>
			{shown ? (
				<div className="relative overflow-hidden rounded-xl">
					<img
						src={resolvePhotoUrl(shown)}
						alt="Aperçu du signalement"
						className="w-full object-cover"
					/>
					<div className="absolute top-2 right-2 flex gap-2">
						<button
							type="button"
							onClick={() => inputRef.current?.click()}
							disabled={processing}
							className="btn btn-square btn-sm rounded-xl border-none bg-black/40 shadow-none hover:bg-black/60 disabled:opacity-60"
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
							onClick={handleRemove}
							disabled={processing}
							className="btn btn-square btn-sm rounded-xl border-none bg-black/40 shadow-none hover:bg-black/60 disabled:opacity-60"
							aria-label={
								revertsToExisting
									? "Retirer la nouvelle photo"
									: "Supprimer la photo"
							}
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
					onClick={() => inputRef.current?.click()}
					disabled={processing}
					className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/20 bg-transparent py-6 text-sm font-bold text-primary/60 hover:bg-primary/5 disabled:opacity-60"
				>
					<Icon
						name="camera"
						className="h-5 w-5 fill-primary/40"
						aria-hidden="true"
					/>
					{processing
						? "Traitement de la photo..."
						: "Ajouter une photo"}
				</button>
			)}
			{shown && processing && (
				<p className="text-sm text-primary/60" aria-live="polite">
					Traitement de la photo...
				</p>
			)}
			{error != null && (
				<p role="alert" className="text-sm text-error">
					{error}
				</p>
			)}
		</div>
	);
}
