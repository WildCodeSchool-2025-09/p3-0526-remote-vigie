import DangerModal from "@/components/Danger/DangerModal/DangerModal";
import { useRef } from "react";
import { navItems } from "../../../config/NavItemConfig";
import { useAuth } from "../../../contexts/AuthContext";
import NavItem from "../NavItem/NavItem";

function NavBar() {
	const { user } = useAuth();
	const dangerModalRef = useRef<HTMLDialogElement>(null);

	return (
		<>
			<nav
				className="sticky bottom-0 z-10 grid h-[calc(5rem+env(safe-area-inset-bottom,0px))] shrink-0 grid-flow-col auto-cols-fr bg-(--primary) lg:order-first lg:sticky lg:top-0 lg:bottom-auto lg:h-dvh lg:w-24 lg:grid-flow-row lg:auto-rows-fr lg:pt-8"
				aria-label="Navigation principale"
			>
				{navItems
					.filter((item) => !item.requiresAuth || user != null)
					.map(
						({
							key,
							loggedOutTo,
							loggedOutLabel,
							disabledWhenLoggedOut,
							action,
							...item
						}) => {
							const isLoggedOut = user == null;
							const resolved = {
								...item,
								...(isLoggedOut && loggedOutTo != null
									? {
											to: loggedOutTo,
											label: loggedOutLabel ?? item.label,
										}
									: {}),
								...(isLoggedOut && disabledWhenLoggedOut
									? { disabled: true }
									: {}),
							};
							return (
								<NavItem
									key={key}
									{...resolved}
									onClick={
										action === "danger"
											? () =>
													dangerModalRef.current?.showModal()
											: undefined
									}
								/>
							);
						},
					)}
			</nav>
			<DangerModal
				dialogRef={dangerModalRef}
				onConfirm={() => dangerModalRef.current?.close()}
			/>
		</>
	);
}

export default NavBar;
