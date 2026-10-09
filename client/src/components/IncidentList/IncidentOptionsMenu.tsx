import {
	type CSSProperties,
	type FocusEvent,
	type KeyboardEvent,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import Icon from "@/components/Icon/Icon";

type IncidentOptionsMenuProps = {
	includeResolved: boolean;
	onIncludeResolvedChange: (value: boolean) => void;
};

// Après un choix, le menu reste un instant visible (la case cochée se voit) puis s'efface.
const CLOSE_DELAY_MS = 350;
const FADE_DURATION_MS = 150;

// Bouton « trois points » qui déplie les options d'affichage (pour l'instant :
// inclure les incidents résolus). Une pastille signale une option active.
export default function IncidentOptionsMenu({
	includeResolved,
	onIncludeResolvedChange,
}: IncidentOptionsMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isFading, setIsFading] = useState(false);
	const closeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const checkboxRef = useRef<HTMLInputElement>(null);
	const panelId = useId();

	function clearCloseTimers() {
		for (const timer of closeTimersRef.current) clearTimeout(timer);
		closeTimersRef.current = [];
	}

	function closeSoftly() {
		clearCloseTimers();
		closeTimersRef.current = [
			setTimeout(() => setIsFading(true), CLOSE_DELAY_MS),
			setTimeout(() => {
				setIsOpen(false);
				buttonRef.current?.focus();
			}, CLOSE_DELAY_MS + FADE_DURATION_MS),
		];
	}

	useEffect(() => {
		return () => {
			for (const timer of closeTimersRef.current) clearTimeout(timer);
		};
	}, []);

	// Fermé par une autre voie pendant l'attente : plus rien à terminer.
	useEffect(() => {
		if (!isOpen) {
			for (const timer of closeTimersRef.current) clearTimeout(timer);
			closeTimersRef.current = [];
			setIsFading(false);
		}
	}, [isOpen]);

	// À l'ouverture, le focus passe à la case ; un clic ailleurs referme.
	useEffect(() => {
		if (!isOpen) return;

		checkboxRef.current?.focus();

		function closeOnOutsidePointer(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
		};
	}, [isOpen]);

	function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (isOpen && event.key === "Escape") {
			event.preventDefault();
			setIsOpen(false);
			buttonRef.current?.focus();
		}
	}

	// Tabulation vers un élément extérieur : le menu se referme.
	function handleBlur(event: FocusEvent<HTMLDivElement>) {
		const next = event.relatedTarget;
		if (
			isOpen &&
			next instanceof Node &&
			!containerRef.current?.contains(next)
		) {
			setIsOpen(false);
		}
	}

	return (
		<div
			ref={containerRef}
			className="relative"
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-expanded={isOpen}
				aria-controls={isOpen ? panelId : undefined}
				onClick={() => setIsOpen((open) => !open)}
				className="btn relative h-11 min-h-11 w-9 min-w-0 rounded-2xl border-0 bg-(--white) px-0 text-primary shadow"
			>
				<span className="sr-only">
					Options d'affichage
					{includeResolved ? " (incidents résolus inclus)" : ""}
				</span>
				<Icon
					name="menuDotsVertical"
					className="size-5 fill-current"
					aria-hidden="true"
				/>
				{includeResolved && (
					<span
						aria-hidden="true"
						className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-primary ring-2 ring-(--white)"
					/>
				)}
			</button>

			{isOpen && (
				<div
					id={panelId}
					// Focalisable : un clic dans le panneau y garde le focus.
					tabIndex={-1}
					className={`absolute top-full right-0 mt-2 w-56 rounded-2xl bg-(--white) p-2 shadow-lg transition-opacity duration-150 focus:outline-none motion-reduce:transition-none ${
						isFading ? "opacity-0" : "opacity-100"
					}`}
				>
					<label
						htmlFor="incident-include-resolved"
						className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm font-bold text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-primary"
					>
						<input
							ref={checkboxRef}
							id="incident-include-resolved"
							type="checkbox"
							checked={includeResolved}
							onChange={(event) => {
								onIncludeResolvedChange(event.target.checked);
								// Le menu se referme pour laisser voir la carte.
								closeSoftly();
							}}
							className="checkbox checkbox-accent checkbox-sm shrink-0"
							style={
								{
									"--radius-selector": "0.25rem",
								} as CSSProperties
							}
						/>
						Incidents résolus
					</label>
				</div>
			)}
		</div>
	);
}
