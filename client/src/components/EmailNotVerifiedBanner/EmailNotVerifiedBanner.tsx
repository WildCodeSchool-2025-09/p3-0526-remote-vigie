import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/auth/AuthContext";

export default function EmailNotVerifiedBanner() {
	const { user } = useAuth();

	if (user == null || user.emailVerified) return null;

	return (
		<output className="relative z-10 mx-4 -mt-6 flex shrink-0 items-center gap-3 rounded-2xl bg-warning px-4 py-3 text-sm text-primary shadow-sm">
			<Icon
				name="envelope"
				className="h-5 w-5 shrink-0 fill-primary"
				aria-hidden="true"
			/>
			<p>
				<strong>Vérifiez votre e-mail.</strong> Certaines actions, comme
				signaler un incident, restent bloquées tant qu'il n'est pas
				confirmé.
			</p>
		</output>
	);
}
