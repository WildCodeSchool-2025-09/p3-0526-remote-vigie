/**
 * Rend un bloc ```mermaid``` en SVG. Utilisé par ReadmeViewer.tsx.
 */

import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

mermaid.initialize({ startOnLoad: false, theme: "neutral" });

export default function MermaidBlock({ chart }: { chart: string }) {
	const id = useId().replace(/:/g, "-");
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		mermaid
			.render(`mermaid-${id}`, chart)
			.then(({ svg }) => {
				if (!cancelled && containerRef.current) {
					containerRef.current.innerHTML = svg;
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: "Erreur de rendu du diagramme.",
					);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [chart, id]);

	if (error) {
		return (
			<pre className="overflow-x-auto rounded-lg border border-error/20 bg-error/5 p-4 text-xs text-error">
				{error}
			</pre>
		);
	}

	return (
		<div
			ref={containerRef}
			className="my-4 flex justify-center overflow-x-auto rounded-lg border border-primary/10 bg-base-100 p-4"
		/>
	);
}
