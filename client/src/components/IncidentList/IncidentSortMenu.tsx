import {
	type FocusEvent,
	type KeyboardEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import Icon from "@/components/Icon/Icon";
import type { IncidentSort } from "@/types/incidentList";

const SORT_GROUPS: {
	title: string;
	options: { value: IncidentSort; label: string }[];
}[] = [
	{
		title: "Trier par — date",
		options: [
			{ value: "date", label: "Plus récents d'abord" },
			{ value: "date_asc", label: "Plus anciens d'abord" },
		],
	},
	{
		title: "Gravité",
		options: [
			{ value: "severity", label: "Plus graves d'abord" },
			{ value: "severity_asc", label: "Moins graves d'abord" },
		],
	},
];

const BUTTON_LABEL: Record<IncidentSort, string> = {
	date: "Plus récents",
	date_asc: "Plus anciens",
	severity: "Plus graves",
	severity_asc: "Moins graves",
};

// Hauteur du menu ouvert (≈ 2 titres + 4 options) et barre de navigation du bas (5rem + marge).
const MENU_HEIGHT_PX = 280;
const NAV_RESERVED_PX = 96;
const MENU_MARGIN_PX = 8;

type MenuPlacement = {
	top?: number;
	bottom?: number;
	right: number;
	maxHeight: number;
};

type IncidentSortMenuProps = {
	value: IncidentSort;
	onChange: (value: IncidentSort) => void;
};

// Bouton qui déplie un menu de tri. Le menu est un groupe de boutons radio
// natifs (deux <fieldset> de même `name`) : flèches, Espace et lecteurs
// d'écran fonctionnent sans ARIA sur mesure.
export default function IncidentSortMenu({
	value,
	onChange,
}: IncidentSortMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [placement, setPlacement] = useState<MenuPlacement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const menuId = useId();
	const groupName = useId();

	const closeAndFocusButton = useCallback(() => {
		setIsOpen(false);
		buttonRef.current?.focus();
	}, []);

	// Le menu est en position fixe : la liste est une zone défilante qui le
	// tronquerait. Il s'ouvre du côté du bouton où il y a le plus de place.
	function openMenu() {
		const rect = buttonRef.current?.getBoundingClientRect();
		if (!rect) return;

		const spaceBelow = window.innerHeight - rect.bottom - NAV_RESERVED_PX;
		const spaceAbove = rect.top;
		const right = Math.max(MENU_MARGIN_PX, window.innerWidth - rect.right);
		const opensUp = spaceBelow < MENU_HEIGHT_PX && spaceAbove > spaceBelow;

		setPlacement(
			opensUp
				? {
						bottom: window.innerHeight - rect.top + MENU_MARGIN_PX,
						right,
						maxHeight: spaceAbove - 2 * MENU_MARGIN_PX,
					}
				: {
						top: rect.bottom + MENU_MARGIN_PX,
						right,
						maxHeight: spaceBelow - MENU_MARGIN_PX,
					},
		);
		setIsOpen(true);
	}

	// À l'ouverture, le focus passe à l'option choisie. Un clic ailleurs, un
	// défilement ou un redimensionnement referment (le menu ne suit pas le bouton).
	useEffect(() => {
		if (!isOpen) return;

		containerRef.current
			?.querySelector<HTMLInputElement>("input:checked")
			?.focus({ preventScroll: true });

		function closeOnOutsidePointer(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		function closeOnScroll(event: Event) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		function closeOnResize() {
			setIsOpen(false);
		}
		document.addEventListener("pointerdown", closeOnOutsidePointer);
		document.addEventListener("scroll", closeOnScroll, true);
		window.addEventListener("resize", closeOnResize);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer);
			document.removeEventListener("scroll", closeOnScroll, true);
			window.removeEventListener("resize", closeOnResize);
		};
	}, [isOpen]);

	function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (!isOpen) return;

		const isOnOption = event.target instanceof HTMLInputElement;
		if (event.key === "Escape" || (event.key === "Enter" && isOnOption)) {
			event.preventDefault();
			closeAndFocusButton();
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
			className="relative shrink-0"
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-expanded={isOpen}
				aria-controls={isOpen ? menuId : undefined}
				onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
				className={`btn min-h-11 gap-1.5 rounded-full border px-4 text-sm font-bold ${
					isOpen
						? "border-primary bg-primary text-accent"
						: "border-primary/15 bg-base-300 text-primary"
				}`}
			>
				<span className="sr-only">Trier les incidents : </span>
				{BUTTON_LABEL[value]}
				<Icon
					name={isOpen ? "angleSmallUp" : "angleSmallDown"}
					className="size-4 fill-current"
					aria-hidden="true"
				/>
			</button>

			{isOpen && placement && (
				<div
					id={menuId}
					style={placement}
					// Focalisable : un clic dans le menu y garde le focus, au lieu de
					// le donner à la section parente (ce qui refermerait le menu).
					tabIndex={-1}
					className="fixed z-1200 w-64 focus:outline-none max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-2xl border border-primary/10 bg-base-100 shadow-lg"
				>
					{SORT_GROUPS.map((group, index) => (
						<fieldset
							key={group.title}
							className={
								index > 0 ? "border-t border-primary/10" : ""
							}
						>
							<legend className="w-full bg-base-200 px-4 py-2 text-xs font-bold tracking-wide text-primary/75 uppercase">
								{group.title}
							</legend>
							{group.options.map((option) => (
								<label
									key={option.value}
									className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-t border-primary/10 px-4 py-3 text-base text-black has-[:checked]:bg-(--bg-success) has-[:checked]:font-bold has-[:checked]:text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-primary"
								>
									<input
										type="radio"
										name={groupName}
										value={option.value}
										checked={value === option.value}
										onChange={() => onChange(option.value)}
										// Clic souris : referme. Les flèches choisissent sans fermer.
										onClick={(event) => {
											if (event.detail > 0)
												closeAndFocusButton();
										}}
										className="peer sr-only"
									/>
									{option.label}
									<Icon
										name="check"
										className="hidden size-4 fill-primary peer-checked:block"
										aria-hidden="true"
									/>
								</label>
							))}
						</fieldset>
					))}
				</div>
			)}
		</div>
	);
}
