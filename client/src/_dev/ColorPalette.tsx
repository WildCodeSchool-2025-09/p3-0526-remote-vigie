/**
 * ⚠️ PAGE DE DEV — pas une page de l'app.
 * Route : /help/colors. Sert uniquement à visualiser la palette déclarée dans src/styles/theme.css.
 * Les pastilles rendent var(--x) : elles reflètent le thème en direct.
 */

import type { ReactNode } from "react";
import BackButton from "@/_dev/BackButton";

type Swatch = { varName: string; hex?: string; label: string };

const brand: Swatch[] = [
  { varName: "--primary-dark", label: "Primary dark", hex: "mix 50% black" },
  { varName: "--primary", hex: "#0b4619", label: "Primary" },
  { varName: "--primary-light", label: "Primary light", hex: "mix 10% white" },
  {
    varName: "--secondary-dark",
    label: "Secondary dark",
    hex: "mix 50% black",
  },
  { varName: "--secondary", hex: "#116530", label: "Secondary" },
  {
    varName: "--secondary-light",
    label: "Secondary light",
    hex: "mix 10% white",
  },
  { varName: "--accent-dark", label: "Accent dark", hex: "mix 50% black" },
  { varName: "--accent", hex: "#ffcc1d", label: "Accent" },
  { varName: "--accent-light", label: "Accent light", hex: "mix 10% white" },
  { varName: "--grey", hex: "#c9c9c9", label: "Grey" },
];

const semantic: {
  varName: string;
  hex: string;
  bgVar: string;
  label: string;
}[] = [
  { varName: "--info", hex: "#25a5e0", bgVar: "--bg-info", label: "Info" },
  {
    varName: "--success",
    hex: "#116530",
    bgVar: "--bg-success",
    label: "Success",
  },
  {
    varName: "--warning",
    hex: "#ffcc1d",
    bgVar: "--bg-warning",
    label: "Warning",
  },
  { varName: "--error", hex: "#c1392b", bgVar: "--bg-error", label: "Error" },
];

const backgrounds: Swatch[] = [
  { varName: "--bg-dark", hex: "#e8e8cc", label: "Fond arrière" },
  { varName: "--bg-default", hex: "#f6f5e9", label: "Fond des cadres" },
  { varName: "--bg-light", hex: "#fcfbf1", label: "Fond avant" },
];

type IncidentType = {
  varName: string;
  hex: string;
  bgVar: string;
  bgHex: string;
  label: string;
  group: string;
};

const types: IncidentType[] = [
  {
    varName: "--fire",
    hex: "#d8323e",
    bgVar: "--bg-fire",
    bgHex: "#f4e9df",
    label: "Feu",
    group: "Feu et chaleur",
  },
  {
    varName: "--insect",
    hex: "#d19a00",
    bgVar: "--bg-insect",
    bgHex: "#f4f0db",
    label: "Nid d'insectes",
    group: "Feu et chaleur",
  },
  {
    varName: "--flood",
    hex: "#1f8fd0",
    bgVar: "--bg-flood",
    bgHex: "#e9efe7",
    label: "Inondation",
    group: "Eau",
  },
  {
    varName: "--hail",
    hex: "#6e9ad4",
    bgVar: "--bg-hail",
    bgHex: "#eef0e8",
    label: "Grêle",
    group: "Eau",
  },
  {
    varName: "--glaze",
    hex: "#2e9aa6",
    bgVar: "--bg-glaze",
    bgHex: "#eaf0e5",
    label: "Verglas",
    group: "Froid",
  },
  {
    varName: "--snow",
    hex: "#93bede",
    bgVar: "--bg-snow",
    bgHex: "#f0f2e8",
    label: "Neige",
    group: "Froid",
  },
  {
    varName: "--storm",
    hex: "#4f6e7c",
    bgVar: "--bg-storm",
    bgHex: "#dfe2da",
    label: "Tempête",
    group: "Vent",
  },
  {
    varName: "--tornado",
    hex: "#c2661f",
    bgVar: "--bg-tornado",
    bgHex: "#efe1cd",
    label: "Tornade",
    group: "Vent",
  },
  {
    varName: "--rockfall",
    hex: "#574a5e",
    bgVar: "--bg-rockfall",
    bgHex: "#e0ddd6",
    label: "Éboulement",
    group: "Terre",
  },
  {
    varName: "--tree",
    hex: "#2f8a38",
    bgVar: "--bg-tree",
    bgHex: "#dae6d0",
    label: "Chute d'arbre",
    group: "Végétal",
  },
  {
    varName: "--wild",
    hex: "#6e4a2e",
    bgVar: "--bg-wild",
    bgHex: "#e3ddcf",
    label: "Animal sauvage",
    group: "Animal",
  },
  {
    varName: "--animal",
    hex: "#5e4a63",
    bgVar: "--bg-animal",
    bgHex: "#e1ddd6",
    label: "Animal perdu",
    group: "Animal",
  },
];

type DangerLevel = {
  n: number;
  varName: string;
  hex: string;
  bgVar: string;
  bgHex: string;
  label: string;
};

const levels: DangerLevel[] = [
  {
    n: 1,
    varName: "--level-1",
    hex: "#3a8f3f",
    bgVar: "--bg-level-1",
    bgHex: "#e4ecd9",
    label: "Faible",
  },
  {
    n: 2,
    varName: "--level-2",
    hex: "#9bbb2f",
    bgVar: "--bg-level-2",
    bgHex: "#edefd7",
    label: "Modéré",
  },
  {
    n: 3,
    varName: "--level-3",
    hex: "#e0a81f",
    bgVar: "--bg-level-3",
    bgHex: "#f4eed6",
    label: "Important",
  },
  {
    n: 4,
    varName: "--level-4",
    hex: "#e8600f",
    bgVar: "--bg-level-4",
    bgHex: "#f8e0cd",
    label: "Élevé",
  },
  {
    n: 5,
    varName: "--level-5",
    hex: "#c1392b",
    bgVar: "--bg-level-5",
    bgHex: "#f5e2df",
    label: "Critique",
  },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mt-10 mb-3 flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-primary/60">
        {children}
      </h2>
      <span className="h-px flex-1 bg-primary/15" />
    </div>
  );
}

function SwatchCard({ varName, hex, label }: Swatch) {
  return (
    <div className="rounded-lg border border-primary/10 bg-base-200 p-3">
      <div
        className="h-14 w-full rounded-md border border-primary/10"
        style={{ background: `var(${varName})` }}
      />
      <p className="mt-2 text-sm font-bold text-primary">{label}</p>
      <p className="font-mono text-xs text-primary/50">{varName}</p>
      {hex && (
        <p
          className={`font-mono text-xs text-primary/40 ${hex.startsWith("#") ? "uppercase" : ""}`}
        >
          {hex}
        </p>
      )}
    </div>
  );
}

export default function ColorPalette() {
  const groups = [...new Set(types.map((t) => t.group))];

  return (
    <div className="min-h-screen bg-base-200 px-6 py-10 text-primary md:px-12">
      <div className="relative mx-auto max-w-5xl">
        <p className="inline-block rounded bg-error/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-error">
          Dev only · /help/colors
        </p>
        <BackButton />
        <p className="mt-3 text-sm font-semibold italic text-primary/70">
          Vigie · design system
        </p>
        <h1 className="mt-1 text-4xl font-black">Couleurs de theme.css</h1>
        <p className="mt-3 max-w-2xl text-sm text-primary/60">
          Chaque pastille rend <span className="font-mono">var(--x)</span> :
          elle reflète le thème en direct. Le hex indiqué est la valeur
          littérale du fichier au moment de l'écriture.
        </p>

        <SectionTitle>Marque</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {brand.map((s) => (
            <SwatchCard key={s.varName} {...s} />
          ))}
        </div>

        <SectionTitle>Sémantique</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {semantic.map((s) => (
            <div
              key={s.varName}
              className="overflow-hidden rounded-lg border border-primary/10 bg-base-200"
            >
              <div
                className="h-14 w-full"
                style={{ background: `var(${s.varName})` }}
              />
              <div
                className="h-8 w-full"
                style={{ background: `var(${s.bgVar})` }}
              />
              <div className="p-3">
                <p className="text-sm font-bold text-primary">{s.label}</p>
                <p className="font-mono text-xs text-primary/50">{s.varName}</p>
                <p className="font-mono text-xs text-primary/40">{s.bgVar}</p>
              </div>
            </div>
          ))}
        </div>

        <SectionTitle>Fonds</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {backgrounds.map((s) => (
            <SwatchCard key={s.varName} {...s} />
          ))}
        </div>

        <SectionTitle>Types d'incident</SectionTitle>
        {groups.map((group) => (
          <div key={group} className="mb-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-primary/40">
              {group}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {types
                .filter((t) => t.group === group)
                .map((t) => (
                  <div
                    key={t.varName}
                    className="flex items-stretch overflow-hidden rounded-xl border border-primary/10"
                    style={{ background: `var(${t.bgVar})` }}
                  >
                    <span
                      className="w-1.5 shrink-0"
                      style={{ background: `var(${t.varName})` }}
                    />
                    <div className="flex flex-1 items-center gap-4 p-4">
                      <span
                        className="h-12 w-12 shrink-0 rounded-lg border-2"
                        style={{
                          background: `var(${t.varName})`,
                          borderColor: `var(${t.varName})`,
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary">
                          {t.label}
                        </p>
                        <p className="font-mono text-xs text-primary/55">
                          {t.varName} ·{" "}
                          <span className="uppercase">{t.hex}</span>
                        </p>
                        <p className="font-mono text-xs text-primary/40">
                          {t.bgVar} ·{" "}
                          <span className="uppercase">{t.bgHex}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        <SectionTitle>Niveaux de gravité</SectionTitle>
        <div className="mb-5 flex flex-wrap gap-3">
          {levels.map((l) => (
            <div
              key={l.varName}
              className="flex h-24 w-28 flex-col items-center justify-center rounded-xl border-2"
              style={{
                background: `var(${l.bgVar})`,
                borderColor: `var(${l.varName})`,
              }}
            >
              <span
                className="text-2xl font-black"
                style={{ color: `var(${l.varName})` }}
              >
                {l.n}
              </span>
              <span className="text-sm font-semibold text-primary/70">
                {l.label}
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {levels.map((l) => (
            <div
              key={l.varName}
              className="flex items-stretch overflow-hidden rounded-xl border border-primary/10"
              style={{ background: `var(${l.bgVar})` }}
            >
              <span
                className="w-1.5 shrink-0"
                style={{ background: `var(${l.varName})` }}
              />
              <div className="flex flex-1 items-center gap-4 p-4">
                <span
                  className="h-12 w-12 shrink-0 rounded-lg border-2"
                  style={{
                    background: `var(${l.varName})`,
                    borderColor: `var(${l.varName})`,
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary">
                    {l.n} · {l.label}
                  </p>
                  <p className="font-mono text-xs text-primary/55">
                    {l.varName} · <span className="uppercase">{l.hex}</span>
                  </p>
                  <p className="font-mono text-xs text-primary/40">
                    {l.bgVar} · <span className="uppercase">{l.bgHex}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
