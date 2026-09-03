import Icon from "@/components/Icon/Icon";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <div className="inline-flex items-center gap-2 rounded-full bg-base-300 px-4 py-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
          <Icon
            name="marker"
            className="h-3.5 w-3.5 fill-base-300"
            aria-hidden="true"
          />
        </span>
        <p className="text-sm text-primary">
          <span className="font-bold">Incident élevé</span>
          <span className="text-primary/60"> — 1 type · rayon 3 km</span>
        </p>
      </div>
    </div>
  );
}
