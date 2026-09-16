import Icon from "@/components/Icon/Icon";
import type { RefObject } from "react";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
};

export default function IncidentEditModal({ dialogRef }: Props) {
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
							className="btn btn-square btn-sm rounded-full border-none bg-base-300 shadow-none"
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
				<div className="flex w-full items-start gap-3 rounded-2xl bg-base-100 px-5 py-3 mt-5">
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
							className="btn btn-md grow basis-1/3 rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
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
