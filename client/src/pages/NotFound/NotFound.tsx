import { useNavigate } from "react-router";
import Icon from "../../components/Icon/Icon";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-base-100 p-4">
			<div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-base-300 p-4 text-center">
				<span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-warning)">
					<Icon
						name="exclamation"
						className="h-8 w-8 fill-warning"
						aria-hidden="true"
					/>
				</span>
				<h1 className="font-title text-lg font-bold text-primary">
					Page introuvable
				</h1>
				<p className="mt-1 text-sm text-black">
					Cette page n'existe pas ou a été déplacée.
				</p>
			
				<button
					type="button"
					onClick={() => navigate("/")}
					className="btn btn-accent btn-md w-full rounded-full border-none px-5 font-bold"
				>
					Retour à l'accueil
				</button>
			</div>
		</div>
	);
}
