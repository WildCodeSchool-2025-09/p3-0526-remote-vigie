// ⚠️ DEV ONLY — famille "Buttons" de la galerie de composants (/help/components).

import Example from "@/_dev/design-system/Example";
import SectionLabel from "@/_dev/design-system/SectionLabel";
import Icon from "@/components/Icon/Icon";

export default function ButtonsExamples() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<SectionLabel>Flat</SectionLabel>

			<Example
				title="Button flat"
				description="CTA principal : fond accent (jaune), texte primary (vert foncé), forme pilule."
				code={`<button
  type="button"
  className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
>
  Signaler l'incident
</button>`}
			>
				<button
					type="button"
					className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
				>
					Signaler l'incident
				</button>
			</Example>

			<Example
				title="Button flat · inactif"
				description="Même bouton, attribut disabled : daisyUI neutralise la couleur accent et bloque le clic."
				code={`<button
  type="button"
  disabled
  className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
>
  Signaler l'incident
</button>`}
			>
				<button
					type="button"
					disabled
					className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
				>
					Signaler l'incident
				</button>
			</Example>

			<Example
				title="Button flat · avec icône"
				description="Icône + libellé. btn (daisyUI) aligne et espace déjà les enfants ; l'icône hérite de la couleur du texte via currentColor."
				code={`<button
  type="button"
  className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
>
  <Icon name="check" className="h-4 w-4 fill-primary" aria-hidden="true" />
  Confirmer
</button>`}
			>
				<button
					type="button"
					className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
				>
					<Icon
						name="check"
						className="h-4 w-4 fill-primary"
						aria-hidden="true"
					/>
					Confirmer
				</button>
			</Example>

			<SectionLabel>Stroke</SectionLabel>

			<Example
				title="Button stroke"
				description="Variante secondaire : fond transparent, bordure et texte primary. Sans btn-outline — survol en teinte primary légère, pas d'inversion de fond."
				code={`<button
  type="button"
  className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
>
  Retour à l'accueil
</button>`}
			>
				<button
					type="button"
					className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
				>
					Retour à l'accueil
				</button>
			</Example>

			<Example
				title="Button stroke · inactif"
				description="Même bouton, attribut disabled : bordure et texte atténués (via disabled:), clic bloqué."
				code={`<button
  type="button"
  disabled
  className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 disabled:border-primary/20 disabled:text-primary/40 px-5"
>
  Retour à l'accueil
</button>`}
			>
				<button
					type="button"
					disabled
					className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 disabled:border-primary/20 disabled:text-primary/40 px-5"
				>
					Retour à l'accueil
				</button>
			</Example>

			<Example
				title="Button stroke · avec icône"
				description="Icône + libellé. L'icône hérite du primary via currentColor (bordure et texte du bouton)."
				code={`<button
  type="button"
  className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
>
  <Icon name="arrowSmallLeft" className="h-4 w-4 fill-primary" aria-hidden="true" />
  Retour à l'accueil
</button>`}
			>
				<button
					type="button"
					className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
				>
					<Icon
						name="arrowSmallLeft"
						className="h-4 w-4 fill-primary"
						aria-hidden="true"
					/>
					Retour à l'accueil
				</button>
			</Example>

			<SectionLabel>Square</SectionLabel>

			<Example
				title="Button square"
				description="Bouton icône seule, forme carrée arrondie, fond transparent, bordure et icône primary."
				code={`<button
  type="button"
  className="btn btn-square btn-md rounded-2xl border-2 border-primary bg-transparent shadow-none hover:bg-primary/10"
  aria-label="Partager"
>
  <Icon name="share" className="h-4 w-4 fill-primary" aria-hidden="true" />
</button>`}
			>
				<button
					type="button"
					className="btn btn-square btn-md rounded-2xl border-2 border-primary bg-transparent shadow-none hover:bg-primary/10"
					aria-label="Partager"
				>
					<Icon
						name="share"
						className="h-4 w-4 fill-primary"
						aria-hidden="true"
					/>
				</button>
			</Example>

			<SectionLabel>Paires</SectionLabel>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Paire flat + stroke"
				description="Duo d'actions sur une ligne : action principale (flat) en basis-2/3, action secondaire (stroke) en basis-1/3. Le conteneur flex gère le partage."
				code={`<div className="flex w-full gap-3">
  <button
    type="button"
    className="btn btn-accent btn-md basis-2/3 rounded-full border-none px-6 font-bold"
  >
    Confirmer
  </button>
  <button
    type="button"
    className="btn btn-md basis-1/3 rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-6"
  >
    Annuler
  </button>
</div>`}
			>
				<div className="flex w-full gap-3">
					<button
						type="button"
						className="btn btn-accent btn-md basis-2/3 rounded-full border-none px-6 font-bold"
					>
						Confirmer
					</button>
					<button
						type="button"
						className="btn btn-md basis-1/3 rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-6"
					>
						Annuler
					</button>
				</div>
			</Example>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Paire stroke + square"
				description="Duo d'actions sur une ligne : action principale (stroke) qui occupe l'espace restant, action secondaire (square) à taille fixe. Icône crayon à ajouter aux assets — texte seul en attendant."
				code={`<div className="flex w-full items-center gap-3">
  <button
    type="button"
    className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
  >
    Modifier
  </button>
  <button
    type="button"
    className="btn btn-square btn-md rounded-2xl border-2 border-primary bg-transparent shadow-none hover:bg-primary/10"
    aria-label="Partager"
  >
    <Icon name="share" className="h-4 w-4 fill-primary" aria-hidden="true" />
  </button>
</div>`}
			>
				<div className="flex w-full items-center gap-3">
					<button
						type="button"
						className="btn btn-md grow rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
					>
						Modifier
					</button>
					<button
						type="button"
						className="btn btn-square btn-md rounded-2xl border-2 border-primary bg-transparent shadow-none hover:bg-primary/10"
						aria-label="Partager"
					>
						<Icon
							name="share"
							className="h-4 w-4 fill-primary"
							aria-hidden="true"
						/>
					</button>
				</div>
			</Example>
		</div>
	);
}
