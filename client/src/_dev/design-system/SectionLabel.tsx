// ⚠️ DEV ONLY — séparateur entre sous-groupes d'exemples au sein d'une famille (/help/components).

import type { ReactNode } from "react";

export default function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<div className="col-span-full mt-2 mb-1 flex items-center gap-3">
			<h3 className="text-xs font-bold uppercase tracking-widest text-primary/60">
				{children}
			</h3>
			<span className="h-px flex-1 bg-primary/15" />
		</div>
	);
}
