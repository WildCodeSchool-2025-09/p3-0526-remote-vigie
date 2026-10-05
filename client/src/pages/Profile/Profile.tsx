import backgroundIncident from "@/assets/images/background-incident.jpg";
import EmailNotVerifiedBanner from "@/components/EmailNotVerifiedBanner/EmailNotVerifiedBanner";
import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/auth/AuthContext";
import type { Address } from "@/types/auth";
import { Link, useNavigate } from "react-router";

function formatAddress(address: Address | undefined) {
	if (address == null) return "Non renseignée";

	const place = `${address.city} (${address.postal_code})`;
	return address.street_line ? `${address.street_line} · ${place}` : place;
}

function AccountField({ label, value }: { label: string; value: string }) {
	return (
		<div className="border-b border-dashed border-primary/15 py-3">
			<dt className="text-xs uppercase tracking-widest text-primary/50">
				{label}
			</dt>
			<dd className="mt-1 wrap-break-word text-base font-bold text-primary">
				{value}
			</dd>
		</div>
	);
}

export default function Profile() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const showsEmailBanner = user != null && !user.emailVerified;
	const primaryAddress = user?.addresses.find(
		(address) => address.is_primary,
	);

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	return (
		<main className="min-h-full bg-base-100 pb-10">
			<header className="relative isolate flex h-36 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-16">
				<img
					src={backgroundIncident}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Mon profil
				</h1>
			</header>
			<EmailNotVerifiedBanner />
			<div
				className={`relative mx-4 rounded-3xl bg-base-200 px-5 pt-6 pb-4 ${showsEmailBanner ? "mt-4" : "-mt-8"}`}
			>
				<section aria-labelledby="account-title">
					<h2
						id="account-title"
						className="text-xs font-bold uppercase tracking-widest text-primary/50"
					>
						Compte
					</h2>
					<dl>
						<AccountField
							label="Pseudo"
							value={user?.pseudo ?? ""}
						/>
						<AccountField
							label="E-mail"
							value={user?.email ?? ""}
						/>
						<AccountField
							label="Adresse principale"
							value={formatAddress(primaryAddress)}
						/>
					</dl>
				</section>

				<nav aria-label="Profil">
					<Link
						to="/profile/badges"
						className="flex items-center justify-between border-b border-primary/10 py-4 text-primary"
					>
						Mes badges
						<Icon
							name="angleSmallRight"
							className="h-4 w-4 fill-primary/50"
							aria-hidden="true"
						/>
					</Link>
				</nav>

				<button
					type="button"
					onClick={handleLogout}
					className="w-full py-4 text-center font-bold text-primary"
				>
					Se déconnecter
				</button>
			</div>
		</main>
	);
}
