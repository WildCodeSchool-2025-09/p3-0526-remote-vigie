// ⚠️ DEV ONLY — famille "Cards" de la galerie de composants (/help/components).

import Example from "@/_dev/design-system/Example";
import SectionLabel from "@/_dev/design-system/SectionLabel";
import Icon from "@/components/Icon/Icon";
import { useState } from "react";

function SafetyInstructionsDemo() {
	const [open, setOpen] = useState(true);

	return (
		<div className="w-full rounded-2xl bg-(--primary-light) p-4">
			<button
				type="button"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
			>
				<span className="flex items-center gap-2">
					<Icon
						name="shield"
						className="h-4 w-4 fill-success"
						aria-hidden="true"
					/>
					<h2 className="font-title text-lg font-bold text-primary">
						Consignes de sécurité (2)
					</h2>
				</span>
				<Icon
					name={open ? "angleSmallUp" : "angleSmallDown"}
					className="h-4 w-4 fill-primary/60"
					aria-hidden="true"
				/>
			</button>

			{open && (
				<div className="mt-3 space-y-3 border-t border-primary/10 pt-3 text-sm leading-relaxed">
					<p>
						<span
							className="font-bold"
							style={{ color: "var(--fire)" }}
						>
							Feu
						</span>
						<span className="text-black">
							{" "}
							— Éloignez-vous dans la direction opposée au vent
							pour éviter les fumées. Appelez le 18 ou le 112.
							Fermez portes et volets si vous restez chez vous.
						</span>
					</p>
					<p>
						<span
							className="font-bold"
							style={{ color: "var(--storm)" }}
						>
							Tempête
						</span>
						<span className="text-black">
							{" "}
							— Restez à l'abri et limitez vos déplacements.
							Rangez ou arrimez les objets pouvant être emportés.
							Éloignez-vous des arbres et des lignes électriques.
						</span>
					</p>
				</div>
			)}
		</div>
	);
}

export default function CardExamples() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<SectionLabel>Consignes de sécurité</SectionLabel>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Safety instructions"
				description="Carte pliable listant les consignes de sécurité par type d'incident concerné. Cliquer sur l'en-tête plie/déplie réellement le contenu."
				code={`function SafetyInstructionsCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl bg-(--primary-light) p-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Icon name="shield" className="h-4 w-4 fill-success" aria-hidden="true" />
          <h2 className="font-title text-lg font-bold text-primary">Consignes de sécurité (2)</h2>
        </span>
        <Icon
          name={open ? "angleSmallUp" : "angleSmallDown"}
          className="h-4 w-4 fill-primary/60"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-primary/10 pt-3 text-sm leading-relaxed">
          <p>
            <span className="font-bold" style={{ color: "var(--fire)" }}>
              Feu
            </span>
            <span className="text-black">
              {" "}
              — Éloignez-vous dans la direction opposée au vent pour éviter les fumées.
              Appelez le 18 ou le 112. Fermez portes et volets si vous restez chez vous.
            </span>
          </p>
          <p>
            <span className="font-bold" style={{ color: "var(--storm)" }}>
              Tempête
            </span>
            <span className="text-black">
              {" "}
              — Restez à l'abri et limitez vos déplacements. Rangez ou arrimez les objets
              pouvant être emportés. Éloignez-vous des arbres et des lignes électriques.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}`}
			>
				<SafetyInstructionsDemo />
			</Example>

			<SectionLabel>Incident</SectionLabel>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Card · type"
				description="Carte d'un incident dans une liste : bordure fine tout autour pour se détacher d'un fond de même couleur, liseré épais du type à gauche (border-l-8, borderLeftColor uniquement), pictogramme + label du type, chips gravité + statut, titre (font-title) et méta (lieu · ancienneté)."
				code={`<div
  className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
  style={{ borderLeftColor: "var(--fire)" }}
>
  <div className="flex shrink-0 flex-col items-center gap-1">
    <div
      className="flex h-14 w-14 items-center justify-center rounded-xl"
      style={{ backgroundColor: "var(--bg-fire)" }}
    >
      <Icon name="fire" className="h-7 w-7" aria-hidden="true" />
    </div>
    <span className="text-xs font-bold" style={{ color: "var(--fire)" }}>
      Feu
    </span>
  </div>

  <div className="min-w-0 flex-1">
    <div className="flex flex-wrap items-center gap-1.5">
      <div
        className="badge badge-sm border font-bold"
        style={{ borderColor: "var(--level-5)", backgroundColor: "var(--bg-level-5)", color: "var(--level-5)" }}
      >
        Incident grave
      </div>
      <div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
        En cours
      </div>
    </div>
    <h2 className="mt-1.5 font-title text-lg font-bold text-primary">
      Feu de broussailles au bord de la D904
    </h2>
    <p className="mt-1 text-xs text-primary/50">Alès · il y a 12 min</p>
  </div>

  <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
</div>`}
			>
				<div
					className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
					style={{ borderLeftColor: "var(--fire)" }}
				>
					<div className="flex shrink-0 flex-col items-center gap-1">
						<div
							className="flex h-14 w-14 items-center justify-center rounded-xl"
							style={{ backgroundColor: "var(--bg-fire)" }}
						>
							<Icon
								name="fire"
								className="h-7 w-7"
								aria-hidden="true"
							/>
						</div>
						<span
							className="text-xs font-bold"
							style={{ color: "var(--fire)" }}
						>
							Feu
						</span>
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-1.5">
							<div
								className="badge badge-sm border font-bold"
								style={{
									borderColor: "var(--level-5)",
									backgroundColor: "var(--bg-level-5)",
									color: "var(--level-5)",
								}}
							>
								Incident grave
							</div>
							<div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
								<span
									className="h-1.5 w-1.5 rounded-full bg-success"
									aria-hidden="true"
								/>
								En cours
							</div>
						</div>
						<h2 className="mt-1.5 font-title text-lg font-bold text-primary">
							Feu de broussailles au bord de la D904
						</h2>
						<p className="mt-1 text-xs text-primary/50">
							Alès · il y a 12 min
						</p>
					</div>

					<Icon
						name="angleSmallRight"
						className="h-4 w-4 shrink-0 fill-primary/30"
						aria-hidden="true"
					/>
				</div>
			</Example>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Card · type · liste"
				description="Plusieurs cartes empilées (space-y-3), un type différent par carte. Pas d'encart supplémentaire derrière : dans l'app les cartes reposent directement sur le fond de page, la bordure suffit à les détacher."
				code={`<div className="space-y-3">
  <div
    className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
    style={{ borderLeftColor: "var(--flood)" }}
  >
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--bg-flood)" }}
      >
        <Icon name="flood" className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold" style={{ color: "var(--flood)" }}>
        Inondation
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          className="badge badge-sm border font-bold"
          style={{ borderColor: "var(--level-4)", backgroundColor: "var(--bg-level-4)", color: "var(--level-4)" }}
        >
          Incident élevé
        </div>
        <div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          En cours
        </div>
      </div>
      <h2 className="mt-1.5 font-title text-lg font-bold text-primary">
        Route submergée sous le pont
      </h2>
      <p className="mt-1 text-xs text-primary/50">Saint-Christol · il y a 1 h</p>
    </div>
    <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
  </div>

  <div
    className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
    style={{ borderLeftColor: "var(--wild)" }}
  >
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--bg-wild)" }}
      >
        <Icon name="wild" className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold" style={{ color: "var(--wild)" }}>
        Animal
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          className="badge badge-sm border font-bold"
          style={{ borderColor: "var(--level-2)", backgroundColor: "var(--bg-level-2)", color: "var(--level-2)" }}
        >
          Incident modéré
        </div>
        <div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          En cours
        </div>
      </div>
      <h2 className="mt-1.5 font-title text-lg font-bold text-primary">
        Sanglier sur la départementale
      </h2>
      <p className="mt-1 text-xs text-primary/50">Alès · il y a 3 h</p>
    </div>
    <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
  </div>

  <div
    className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
    style={{ borderLeftColor: "var(--insect)" }}
  >
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--bg-insect)" }}
      >
        <Icon name="insect" className="h-7 w-7" aria-hidden="true" />
      </div>
      <span className="text-xs font-bold" style={{ color: "var(--insect)" }}>
        Insectes
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          className="badge badge-sm border font-bold"
          style={{ borderColor: "var(--level-1)", backgroundColor: "var(--bg-level-1)", color: "var(--level-1)" }}
        >
          Incident faible
        </div>
        <div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          En cours
        </div>
      </div>
      <h2 className="mt-1.5 font-title text-lg font-bold text-primary">
        Nid d'insectes près de l'école
      </h2>
      <p className="mt-1 text-xs text-primary/50">Saint-Privat · il y a 6 h</p>
    </div>
    <Icon name="angleSmallRight" className="h-4 w-4 shrink-0 fill-primary/30" aria-hidden="true" />
  </div>
</div>`}
			>
				<div className="space-y-3">
					<div
						className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
						style={{ borderLeftColor: "var(--flood)" }}
					>
						<div className="flex shrink-0 flex-col items-center gap-1">
							<div
								className="flex h-14 w-14 items-center justify-center rounded-xl"
								style={{ backgroundColor: "var(--bg-flood)" }}
							>
								<Icon
									name="flood"
									className="h-7 w-7"
									aria-hidden="true"
								/>
							</div>
							<span
								className="text-xs font-bold"
								style={{ color: "var(--flood)" }}
							>
								Inondation
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-1.5">
								<div
									className="badge badge-sm border font-bold"
									style={{
										borderColor: "var(--level-4)",
										backgroundColor: "var(--bg-level-4)",
										color: "var(--level-4)",
									}}
								>
									Incident élevé
								</div>
								<div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
									<span
										className="h-1.5 w-1.5 rounded-full bg-success"
										aria-hidden="true"
									/>
									En cours
								</div>
							</div>
							<h2 className="mt-1.5 font-title text-lg font-bold text-primary">
								Route submergée sous le pont
							</h2>
							<p className="mt-1 text-xs text-primary/50">
								Saint-Christol · il y a 1 h
							</p>
						</div>
						<Icon
							name="angleSmallRight"
							className="h-4 w-4 shrink-0 fill-primary/30"
							aria-hidden="true"
						/>
					</div>

					<div
						className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
						style={{ borderLeftColor: "var(--wild)" }}
					>
						<div className="flex shrink-0 flex-col items-center gap-1">
							<div
								className="flex h-14 w-14 items-center justify-center rounded-xl"
								style={{ backgroundColor: "var(--bg-wild)" }}
							>
								<Icon
									name="wild"
									className="h-7 w-7"
									aria-hidden="true"
								/>
							</div>
							<span
								className="text-xs font-bold"
								style={{ color: "var(--wild)" }}
							>
								Animal
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-1.5">
								<div
									className="badge badge-sm border font-bold"
									style={{
										borderColor: "var(--level-2)",
										backgroundColor: "var(--bg-level-2)",
										color: "var(--level-2)",
									}}
								>
									Incident modéré
								</div>
								<div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
									<span
										className="h-1.5 w-1.5 rounded-full bg-success"
										aria-hidden="true"
									/>
									En cours
								</div>
							</div>
							<h2 className="mt-1.5 font-title text-lg font-bold text-primary">
								Sanglier sur la départementale
							</h2>
							<p className="mt-1 text-xs text-primary/50">
								Alès · il y a 3 h
							</p>
						</div>
						<Icon
							name="angleSmallRight"
							className="h-4 w-4 shrink-0 fill-primary/30"
							aria-hidden="true"
						/>
					</div>

					<div
						className="flex items-center gap-3 rounded-2xl border border-l-8 border-primary/10 bg-base-300 p-3"
						style={{ borderLeftColor: "var(--insect)" }}
					>
						<div className="flex shrink-0 flex-col items-center gap-1">
							<div
								className="flex h-14 w-14 items-center justify-center rounded-xl"
								style={{ backgroundColor: "var(--bg-insect)" }}
							>
								<Icon
									name="insect"
									className="h-7 w-7"
									aria-hidden="true"
								/>
							</div>
							<span
								className="text-xs font-bold"
								style={{ color: "var(--insect)" }}
							>
								Insectes
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-1.5">
								<div
									className="badge badge-sm border font-bold"
									style={{
										borderColor: "var(--level-1)",
										backgroundColor: "var(--bg-level-1)",
										color: "var(--level-1)",
									}}
								>
									Incident faible
								</div>
								<div className="badge badge-sm gap-1.5 border-0 font-bold bg-(--primary-light) text-success">
									<span
										className="h-1.5 w-1.5 rounded-full bg-success"
										aria-hidden="true"
									/>
									En cours
								</div>
							</div>
							<h2 className="mt-1.5 font-title text-lg font-bold text-primary">
								Nid d'insectes près de l'école
							</h2>
							<p className="mt-1 text-xs text-primary/50">
								Saint-Privat · il y a 6 h
							</p>
						</div>
						<Icon
							name="angleSmallRight"
							className="h-4 w-4 shrink-0 fill-primary/30"
							aria-hidden="true"
						/>
					</div>
				</div>
			</Example>

			<SectionLabel>Messages d'état</SectionLabel>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Card · centrée"
				description="Carte d'état vide : icône dans un cercle bg-(--bg-success), h2 (font-title) + paragraphe centrés, deux CTA pleine largeur empilés (flat + stroke, repris de la famille Buttons)."
				code={`<div className="flex flex-col items-center gap-4 rounded-3xl bg-base-300 p-4 text-center">
  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-success)">
    <Icon name="check" className="h-8 w-8 fill-success" aria-hidden="true" />
  </span>
  <div>
    <h2 className="font-title text-lg font-bold text-primary">
      Votre compte est vérifié
    </h2>
    <p className="mt-2 text-sm text-black">
      Vous pouvez maintenant signaler un incident et recevoir les alertes de
      votre zone.
    </p>
  </div>
  <button
    type="button"
    className="btn btn-accent btn-md w-full rounded-full border-none px-5 font-bold"
  >
    Aller à l'accueil
  </button>
  <button
    type="button"
    className="btn btn-md w-full rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
  >
    Signaler un incident
  </button>
</div>`}
			>
				<div className="flex flex-col items-center gap-4 rounded-3xl bg-base-300 p-4 text-center">
					<span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-success)">
						<Icon
							name="check"
							className="h-8 w-8 fill-success"
							aria-hidden="true"
						/>
					</span>
					<div>
						<h2 className="font-title text-lg font-bold text-primary">
							Votre compte est vérifié
						</h2>
						<p className="mt-2 text-sm text-black">
							Vous pouvez maintenant signaler un incident et
							recevoir les alertes de votre zone.
						</p>
					</div>
					<button
						type="button"
						className="btn btn-accent btn-md w-full rounded-full border-none px-5 font-bold"
					>
						Aller à l'accueil
					</button>
					<button
						type="button"
						className="btn btn-md w-full rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
					>
						Signaler un incident
					</button>
				</div>
			</Example>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Card · message · info"
				description="Carte d'erreur/statut : même fond (bg-base-300) que Card · centrée, icône réduite à gauche (h-8 w-8, cercle bg-(--primary-light) + icône fill-primary — même logique « teinte claire de la couleur de l'icône » que Card · centrée), titre + description empilés à sa droite, deux CTA côte à côte (flex gap-3, comme la « Paire flat + stroke » de la famille Buttons)."
				code={`<div className="flex flex-col gap-4 rounded-3xl bg-base-300 p-4">
  <div className="flex items-start gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary-light)">
      <Icon name="lock" className="h-3.5 w-3.5 fill-primary" aria-hidden="true" />
    </span>
    <div>
      <h2 className="font-title text-lg font-bold text-primary">
        Vérifiez votre e-mail pour signaler
      </h2>
      <p className="mt-1 text-sm text-black">
        Votre compte est créé, mais pas encore vérifié. Le reste de Vigie
        vous est accessible : carte, liste et fiches d'incident.
      </p>
    </div>
  </div>
  <div className="flex gap-3">
    <button
      type="button"
      className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
    >
      Renvoyer le lien
    </button>
    <button
      type="button"
      className="btn btn-md rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
    >
      Fermer
    </button>
  </div>
</div>`}
			>
				<div className="flex flex-col gap-4 rounded-3xl bg-base-300 p-4">
					<div className="flex items-start gap-3">
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary-light)">
							<Icon
								name="lock"
								className="h-3.5 w-3.5 fill-primary"
								aria-hidden="true"
							/>
						</span>
						<div>
							<h2 className="font-title text-lg font-bold text-primary">
								Vérifiez votre e-mail pour signaler
							</h2>
							<p className="mt-1 text-sm text-black">
								Votre compte est créé, mais pas encore vérifié.
								Le reste de Vigie vous est accessible : carte,
								liste et fiches d'incident.
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							className="btn btn-accent btn-md grow rounded-full border-none px-5 font-bold"
						>
							Renvoyer le lien
						</button>
						<button
							type="button"
							className="btn btn-md rounded-full border-2 border-primary bg-transparent text-primary shadow-none hover:bg-primary/10 px-5"
						>
							Fermer
						</button>
					</div>
				</div>
			</Example>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Card · message · erreur"
				description="Bloc entièrement teinté error, pas seulement l'icône : fond bg-(--bg-error), cercle plein bg-error + icône blanche, titre text-error, CTA principal plein bg-error, CTA secondaire en stroke error."
				code={`<div className="flex flex-col gap-4 rounded-3xl bg-(--bg-error) p-4">
  <div className="flex items-start gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
      <Icon name="exclamation" className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
    </span>
    <div>
      <h2 className="font-title text-lg font-bold text-error">
        Impossible de charger les incidents
      </h2>
      <p className="mt-1 text-sm text-black">
        La connexion au serveur a échoué. Vos alertes ne sont pas affectées :
        elles arriveront normalement.
      </p>
    </div>
  </div>
  <div className="flex gap-3">
    <button
      type="button"
      className="btn btn-md grow rounded-full border-none bg-error px-5 font-bold text-white"
    >
      Réessayer
    </button>
    <button
      type="button"
      className="btn btn-md rounded-full border-2 border-error bg-transparent text-error shadow-none hover:bg-error/10 px-5"
    >
      Fermer
    </button>
  </div>
</div>`}
			>
				<div className="flex flex-col gap-4 rounded-3xl bg-(--bg-error) p-4">
					<div className="flex items-start gap-3">
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
							<Icon
								name="exclamation"
								className="h-3.5 w-3.5 fill-white"
								aria-hidden="true"
							/>
						</span>
						<div>
							<h2 className="font-title text-lg font-bold text-error">
								Impossible de charger les incidents
							</h2>
							<p className="mt-1 text-sm text-black">
								La connexion au serveur a échoué. Vos alertes ne
								sont pas affectées : elles arriveront
								normalement.
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							className="btn btn-md grow rounded-full border-none bg-error px-5 font-bold text-white"
						>
							Réessayer
						</button>
						<button
							type="button"
							className="btn btn-md rounded-full border-2 border-error bg-transparent text-error shadow-none hover:bg-error/10 px-5"
						>
							Fermer
						</button>
					</div>
				</div>
			</Example>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Card · message · succès"
				description="Symétrique de la version erreur, en success : fond bg-(--bg-success), cercle plein bg-success + icône blanche, titre text-success, CTA principal plein bg-success, CTA secondaire en stroke success."
				code={`<div className="flex flex-col gap-4 rounded-3xl bg-(--bg-success) p-4">
  <div className="flex items-start gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
      <Icon name="check" className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
    </span>
    <div>
      <h2 className="font-title text-lg font-bold text-success">
        Signalement envoyé
      </h2>
      <p className="mt-1 text-sm text-black">
        Vos voisins dans un rayon de 3 km ont été alertés. Vous serez informé
        dès qu'une confirmation sera ajoutée.
      </p>
    </div>
  </div>
  <div className="flex gap-3">
    <button
      type="button"
      className="btn btn-md grow rounded-full border-none bg-success px-5 font-bold text-white"
    >
      Voir le signalement
    </button>
    <button
      type="button"
      className="btn btn-md rounded-full border-2 border-success bg-transparent text-success shadow-none hover:bg-success/10 px-5"
    >
      Retour à l'accueil
    </button>
  </div>
</div>`}
			>
				<div className="flex flex-col gap-4 rounded-3xl bg-(--bg-success) p-4">
					<div className="flex items-start gap-3">
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success">
							<Icon
								name="check"
								className="h-3.5 w-3.5 fill-white"
								aria-hidden="true"
							/>
						</span>
						<div>
							<h2 className="font-title text-lg font-bold text-success">
								Signalement envoyé
							</h2>
							<p className="mt-1 text-sm text-black">
								Vos voisins dans un rayon de 3 km ont été
								alertés. Vous serez informé dès qu'une
								confirmation sera ajoutée.
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							className="btn btn-md grow rounded-full border-none bg-success px-5 font-bold text-white"
						>
							Voir le signalement
						</button>
						<button
							type="button"
							className="btn btn-md rounded-full border-2 border-success bg-transparent text-success shadow-none hover:bg-success/10 px-5"
						>
							Retour à l'accueil
						</button>
					</div>
				</div>
			</Example>

			<Example
				className="sm:col-span-2 lg:col-span-3"
				title="Card · message · type"
				description="Variante plein fond couleur du type (ici --fire) : icône dans un cercle bg-white/20 (translucide, fonctionne quel que soit le type), texte blanc, CTA principal plein blanc + texte de la couleur du type, CTA secondaire en stroke blanc."
				code={`<div className="flex flex-col gap-4 rounded-3xl bg-(--fire) p-4">
  <div className="flex items-start gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-fire)">
      <Icon name="fire" className="h-4 w-4" aria-hidden="true" />
    </span>
    <div>
      <h2 className="font-title text-lg font-bold text-white">
        Un feu est déjà signalé près d'ici
      </h2>
      <p className="mt-1 text-sm text-white/85">
        Feu · à 320 m · signalé à 14:12
      </p>
    </div>
  </div>
  <div className="flex gap-3">
    <button
      type="button"
      className="btn btn-md grow rounded-full border-none bg-white px-5 font-bold text-(--fire)"
    >
      Voir ce signalement
    </button>
    <button
      type="button"
      className="btn btn-md rounded-full border-2 border-white bg-transparent text-white shadow-none hover:bg-white/10 px-5"
    >
      Ignorer
    </button>
  </div>
</div>`}
			>
				<div className="flex flex-col gap-4 rounded-3xl bg-(--fire) p-4">
					<div className="flex items-start gap-3">
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-fire)">
							<Icon
								name="fire"
								className="h-4 w-4"
								aria-hidden="true"
							/>
						</span>
						<div>
							<h2 className="font-title text-lg font-bold text-white">
								Un feu est déjà signalé près d'ici
							</h2>
							<p className="mt-1 text-sm text-white/85">
								Feu · à 320 m · signalé à 14:12
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							className="btn btn-md grow rounded-full border-none bg-white px-5 font-bold text-(--fire)"
						>
							Voir ce signalement
						</button>
						<button
							type="button"
							className="btn btn-md rounded-full border-2 border-white bg-transparent text-white shadow-none hover:bg-white/10 px-5"
						>
							Ignorer
						</button>
					</div>
				</div>
			</Example>
		</div>
	);
}
