import { navItems } from "../../../config/NavItemConfig";
import { useAuth } from "../../../contexts/AuthContext";
import NavItem from "../NavItem/NavItem";

function NavBar() {
	const { user } = useAuth();

	return (
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
						return <NavItem key={key} {...resolved} />;
					},
				)}
		</nav>
	);
}

export default NavBar;
