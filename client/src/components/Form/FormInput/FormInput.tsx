import type { ComponentProps } from "react";

// Champ de saisie texte dans son cadre arrondi. Reçoit tous les attributs
// d'un <input> (id, value, onChange, ref, aria-describedby…).
export default function FormInput(props: ComponentProps<"input">) {
	return (
		<section className="rounded-2xl border border-primary/15 bg-base-300 p-4">
			<input
				{...props}
				className="w-full bg-transparent text-black placeholder:text-black/40 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
			/>
		</section>
	);
}
