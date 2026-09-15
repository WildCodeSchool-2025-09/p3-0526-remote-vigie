import Icon from "@/components/Icon/Icon";
import type { RefObject } from "react";

type Props = {
	dialogRef: RefObject<HTMLDialogElement | null>;
};

export default function IncidentEditModal({ dialogRef }: Props) {
	return (
		<dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
			<div className="modal-box rounded-t-3xl bg-base-100 sm:rounded-3xl">
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
			</div>

			<form method="dialog" className="modal-backdrop">
				<button type="submit">Fermer</button>
			</form>
		</dialog>
	);
}
