// ⚠️ DEV ONLY — famille "Layout" de la galerie de composants (/help/components).

import Example from "@/_dev/design-system/Example";
import SectionLabel from "@/_dev/design-system/SectionLabel";
import bgHome from "@/assets/images/backgroud-home.jpg";
import bgIncidentDetails from "@/assets/images/background-incident-details.jpg";
import bgIncident from "@/assets/images/background-incident.jpg";

export default function LayoutExamples() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-primary/15 bg-base-200 p-4 text-sm leading-relaxed text-primary/70">
        <p className="font-bold text-primary">Modèle en 3 couches</p>
        <p className="mt-1">
          <span className="font-semibold text-primary">Fond de page</span>{" "}
          (bg-base-100) →{" "}
          <span className="font-semibold text-primary">frames</span> (encarts
          bg-base-300, insérés du bord de{" "}
          <span className="font-mono">px-4</span>, espacés de{" "}
          <span className="font-mono">space-y-4</span>, le premier remonte de{" "}
          <span className="font-mono">-mt-8</span> sur le header) →{" "}
          <span className="font-semibold text-primary">header</span> (plein
          cadre, porte une couleur de fond ; l'image passe par-dessus en{" "}
          <span className="font-mono">mix-blend-multiply</span> +{" "}
          <span className="font-mono">opacity-70</span>, porte le h1).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SectionLabel>Header</SectionLabel>

        <Example
          className="sm:col-span-2 lg:col-span-3"
          title="Header · fond primary + h1 accent"
          description="Le cas courant. Bandeau plein cadre (touche les bords, aucun inset), hauteur fixe h-44. Fond bg-primary, image en mix-blend-multiply + opacity-70, h1 en font-title text-accent, sous-titre blanc."
          code={`<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
  <img
    src="/src/assets/images/background-incident.jpg"
    alt=""
    aria-hidden="true"
    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
  />
  <h1 className="font-title text-2xl font-bold text-accent">Nouveau signalement</h1>
  <p className="mt-1 text-sm text-white/85">Vos voisins concernés seront alertés aussitôt.</p>
</header>`}
        >
          <div className="mx-auto w-full max-w-sm">
            <header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
              <img
                src={bgIncident}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
              />
              <h1 className="font-title text-2xl font-bold text-accent">
                Nouveau signalement
              </h1>
              <p className="mt-1 text-sm text-white/85">
                Vos voisins concernés seront alertés aussitôt.
              </p>
            </header>
          </div>
        </Example>

        <Example
          className="sm:col-span-2 lg:col-span-3"
          title="Header · autre image"
          description="Même structure, on change juste l'image (src)."
          code={`<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
  <img
    src="/src/assets/images/backgroud-home.jpg"
    alt=""
    aria-hidden="true"
    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
  />
  <h1 className="font-title text-2xl font-bold text-accent">Autour de vous</h1>
  <p className="mt-1 text-sm text-white/85">Les incidents signalés près de chez vous.</p>
</header>`}
        >
          <div className="mx-auto w-full max-w-sm">
            <header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
              <img
                src={bgHome}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
              />
              <h1 className="font-title text-2xl font-bold text-accent">
                Autour de vous
              </h1>
              <p className="mt-1 text-sm text-white/85">
                Les incidents signalés près de chez vous.
              </p>
            </header>
          </div>
        </Example>

        <Example
          className="sm:col-span-2 lg:col-span-3"
          title="Header · fond de type + h1 blanc"
          description="Variante : le fond porte la couleur d'un type d'incident (ici --rockfall, via style car ce n'est pas un utilitaire Tailwind) et le h1 passe en text-white."
          code={`<header
  className="relative isolate flex h-44 flex-col justify-end overflow-hidden px-4 pt-4 pb-12"
  style={{ background: "var(--rockfall)" }}
>
  <img
    src="/src/assets/images/background-incident-details.jpg"
    alt=""
    aria-hidden="true"
    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
  />
  <h1 className="font-title text-2xl font-bold text-white">Détails de l'incident</h1>
  <p className="mt-1 text-sm text-white/85">Complétez pour aider vos voisins.</p>
</header>`}
        >
          <div className="mx-auto w-full max-w-sm">
            <header
              className="relative isolate flex h-44 flex-col justify-end overflow-hidden px-4 pt-4 pb-12"
              style={{ background: "var(--rockfall)" }}
            >
              <img
                src={bgIncidentDetails}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
              />
              <h1 className="font-title text-2xl font-bold text-white">
                Détails de l'incident
              </h1>
              <p className="mt-1 text-sm text-white/85">
                Complétez pour aider vos voisins.
              </p>
            </header>
          </div>
        </Example>

        <SectionLabel>Frame</SectionLabel>

        <Example
          className="sm:col-span-2 lg:col-span-3"
          title="Frame · inset au bord"
          description="Un encart seul, posé sur le fond de page. Le retrait au bord d'écran est toujours px-4 (identique sur toutes les pages). Radius rounded-2xl, fond bg-base-300, padding interne p-4."
          code={`<div className="px-4">
  <section className="rounded-2xl bg-base-300 p-4">
    …contenu de l'encart…
  </section>
</div>`}
        >
          <div className="mx-auto w-full max-w-sm py-6">
            <div className="px-4">
              <section className="rounded-2xl bg-base-300 p-4">
                <p className="text-sm text-primary/60">…contenu de l'encart…</p>
              </section>
            </div>
          </div>
        </Example>

        <Example
          className="sm:col-span-2 lg:col-span-3"
          title="Frames · pile"
          description="Plusieurs encarts empilés : inset px-4 partagé, écart vertical space-y-4 (identique partout)."
          code={`<div className="space-y-4 px-4">
  <section className="rounded-2xl bg-base-300 p-4">Encart 1</section>
  <section className="rounded-2xl bg-base-300 p-4">Encart 2</section>
  <section className="rounded-2xl bg-base-300 p-4">Encart 3</section>
</div>`}
        >
          <div className="mx-auto w-full max-w-sm py-6">
            <div className="space-y-4 px-4">
              <section className="rounded-2xl bg-base-300 p-4">
                <p className="text-sm text-primary/60">Encart 1</p>
              </section>
              <section className="rounded-2xl bg-base-300 p-4">
                <p className="text-sm text-primary/60">Encart 2</p>
              </section>
              <section className="rounded-2xl bg-base-300 p-4">
                <p className="text-sm text-primary/60">Encart 3</p>
              </section>
            </div>
          </div>
        </Example>

        <SectionLabel>Assemblage</SectionLabel>

        <Example
          className="sm:col-span-2 lg:col-span-3"
          title="Page · header + frames"
          description="L'assemblage de référence. Header plein cadre, puis la pile d'encarts insérée (px-4) et espacée (space-y-4). Le premier encart remonte de -mt-8 pour chevaucher le header ; le pb-12 du header garde le h1 au-dessus."
          code={`<div className="min-h-screen bg-base-100">
  <header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
    <img
      src="/src/assets/images/background-incident.jpg"
      alt=""
      aria-hidden="true"
      className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
    />
    <h1 className="font-title text-2xl font-bold text-accent">Nouveau signalement</h1>
    <p className="mt-1 text-sm text-white/85">Vos voisins concernés seront alertés aussitôt.</p>
  </header>

  <div className="relative -mt-8 space-y-4 px-4 pb-6">
    <section className="rounded-2xl bg-base-300 p-4">
      <h2 className="font-title text-lg font-bold text-primary">
        Que voulez-vous signaler ?
      </h2>
      …
    </section>
    <section className="rounded-2xl bg-base-300 p-4">…</section>
  </div>
</div>`}
        >
          <div className="mx-auto w-full max-w-sm bg-base-100">
            <header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
              <img
                src={bgIncident}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
              />
              <h1 className="font-title text-2xl font-bold text-accent">
                Nouveau signalement
              </h1>
              <p className="mt-1 text-sm text-white/85">
                Vos voisins concernés seront alertés aussitôt.
              </p>
            </header>
            <div className="relative -mt-8 space-y-4 px-4 pb-6">
              <section className="rounded-2xl bg-base-300 p-4">
                <h2 className="font-title text-lg font-bold text-primary">
                  Que voulez-vous signaler ?
                </h2>
                <div className="mt-3 h-40 rounded-lg bg-base-100" />
              </section>
              <section className="rounded-2xl bg-base-300 p-4">
                <p className="text-sm text-primary/60">Détails · facultatif</p>
              </section>
              <section className="rounded-2xl bg-base-300 p-4">
                <p className="text-sm text-primary/60">
                  Choisissez au moins un type pour continuer
                </p>
              </section>
            </div>
          </div>
        </Example>
      </div>
    </div>
  );
}
