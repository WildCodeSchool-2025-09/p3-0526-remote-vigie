// ⚠️ DEV ONLY — famille "Form" de la galerie de composants (/help/components).

import Example from "@/_dev/design-system/Example";
import SectionLabel from "@/_dev/design-system/SectionLabel";
import TextAreaExamples from "@/_dev/design-system/TextAreaExamples";
import Icon from "@/components/Icon/Icon";

export default function FormInputExamples() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<SectionLabel>Champ texte</SectionLabel>

			<Example
				title="FormInput"
				description="État neutre. Bordure légère toujours visible ; le badge d'erreur réserve sa place (invisible) mais ne s'affiche pas. Pas de message en dessous : réservé à l'erreur."
				code={`<div className="w-full">
  <label htmlFor="pseudo" className="mb-1.5 block text-sm font-bold text-primary">
    Pseudo
  </label>
  <div className="relative rounded-xl border-2 border-primary/15 bg-base-100 px-4 py-3">
    <input
      id="pseudo"
      type="text"
      defaultValue="marion_c"
      className="w-full bg-transparent pr-8 text-black placeholder:text-black/40 focus:outline-none"
    />
    <Icon
      name="exclamation"
      className="invisible absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 fill-error"
      aria-hidden="true"
    />
  </div>
</div>`}
			>
				<div className="w-full">
					<label
						htmlFor="pseudo"
						className="mb-1.5 block text-sm font-bold text-primary"
					>
						Pseudo
					</label>
					<div className="relative rounded-xl border-2 border-primary/15 bg-base-100 px-4 py-3">
						<input
							id="pseudo"
							type="text"
							defaultValue="marion_c"
							className="w-full bg-transparent pr-8 text-black placeholder:text-black/40 focus:outline-none"
						/>
						<Icon
							name="exclamation"
							className="invisible absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 fill-error"
							aria-hidden="true"
						/>
					</div>
				</div>
			</Example>

			<Example
				title="FormInput · erreur"
				description="Encart en bordure/fond error, badge rond dans l'encart (aligné à droite du champ) et message d'erreur. Tokens de la charte (error), pas un rouge de maquette."
				code={`<div className="w-full">
  <label htmlFor="pseudo-error" className="mb-1.5 block text-sm font-bold text-primary">
    Pseudo
  </label>
  <div className="relative rounded-xl border-2 border-error bg-error/10 px-4 py-3">
    <input
      id="pseudo-error"
      type="text"
      defaultValue="marion_c"
      aria-invalid="true"
      className="w-full bg-transparent pr-8 text-black placeholder:text-black/40 focus:outline-none"
    />
    <Icon
      name="exclamation"
      className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 fill-error"
      aria-hidden="true"
    />
  </div>
  <p className="mt-1.5 text-xs font-semibold text-error">
    Ce pseudo est déjà utilisé. Essayez-en un autre.
  </p>
</div>`}
			>
				<div className="w-full">
					<label
						htmlFor="pseudo-error"
						className="mb-1.5 block text-sm font-bold text-primary"
					>
						Pseudo
					</label>
					<div className="relative rounded-xl border-2 border-error bg-error/10 px-4 py-3">
						<input
							id="pseudo-error"
							type="text"
							defaultValue="marion_c"
							aria-invalid="true"
							className="w-full bg-transparent pr-8 text-black placeholder:text-black/40 focus:outline-none"
						/>
						<Icon
							name="exclamation"
							className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 fill-error"
							aria-hidden="true"
						/>
					</div>
					<p className="mt-1.5 text-xs font-semibold text-error">
						Ce pseudo est déjà utilisé. Essayez-en un autre.
					</p>
				</div>
			</Example>

			<SectionLabel>Zone de texte</SectionLabel>

			<TextAreaExamples />
		</div>
	);
}
