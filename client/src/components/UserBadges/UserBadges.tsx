import type { AuthorBadge } from "@/types/badge";
import { useEffect, useId, useRef, useState } from "react";

type UserBadgesProps = {
	badges: AuthorBadge[];
	// Spacing classes, applied only when badges are displayed
	className?: string;
};

export default function UserBadges({
	badges,
	className = "",
}: UserBadgesProps) {
	const [openCode, setOpenCode] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const tooltipId = useId();

	useEffect(() => {
		if (openCode === null) return;

		// Only the tooltip and the badge buttons count as "inside"
		const closeOnOutsidePress = (event: PointerEvent) => {
			const target = event.target as Element;
			const pressedTooltip = tooltipRef.current?.contains(target);
			const pressedBadge =
				containerRef.current?.contains(target) &&
				target.closest("button") !== null;

			if (!pressedTooltip && !pressedBadge) setOpenCode(null);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpenCode(null);
		};

		document.addEventListener("pointerdown", closeOnOutsidePress);
		document.addEventListener("keydown", closeOnEscape);

		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePress);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [openCode]);

	if (badges.length === 0) return null;

	const openBadge = badges.find((badge) => badge.code === openCode);

	return (
		<div ref={containerRef} className={`relative ${className}`}>
			<ul aria-label="Badges" className="flex gap-1">
				{badges.map((badge) => {
					const isOpen = badge.code === openCode;

					return (
						<li key={badge.code}>
							<button
								type="button"
								aria-expanded={isOpen}
								aria-describedby={
									isOpen ? tooltipId : undefined
								}
								onClick={() =>
									setOpenCode(isOpen ? null : badge.code)
								}
								className={`size-6 cursor-pointer rounded-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
									isOpen ? "scale-110 drop-shadow-md" : ""
								}`}
							>
								<img
									src={`/badges-png/${badge.icon}`}
									alt={badge.label}
									className="size-full object-contain"
								/>
							</button>
						</li>
					);
				})}
			</ul>

			{openBadge && (
				<div
					ref={tooltipRef}
					id={tooltipId}
					role="tooltip"
					className="absolute top-full left-0 z-20 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl bg-primary p-3 text-xs text-white shadow-lg animate-[pop_0.2s_ease] z-1000"
				>
					<p className="font-bold">{openBadge.label}</p>
					<p className="mt-1">{openBadge.description}</p>
				</div>
			)}
		</div>
	);
}
