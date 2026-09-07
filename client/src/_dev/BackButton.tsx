/**
 * Bouton retour vers la page précédente, utilisé en tête des sous-pages de dev.
 */

import Icon from "@/components/Icon/Icon";
import { useNavigate } from "react-router";

export default function BackButton() {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={() => navigate(-1)}
			className="absolute top-0 right-0 z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/10 bg-base-200 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/50 shadow-sm transition hover:border-primary/30 hover:text-primary"
		>
			<Icon
				name="arrowSmallLeft"
				className="h-3.5 w-3.5"
				aria-hidden="true"
			/>
			Retour
		</button>
	);
}
