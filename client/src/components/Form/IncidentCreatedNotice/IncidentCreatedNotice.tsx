import bgIncident from "@/assets/images/background-incident.jpg";
import Icon from "@/components/Icon/Icon";
import type { Incident } from "@/types/incidentDetails";
import { useNavigate } from "react-router";

type IncidentCreatedNoticeProps = {
	incident: Incident;
};

export default function IncidentCreatedNotice({
	incident,
}: IncidentCreatedNoticeProps) {
	const navigate = useNavigate();

	return (
		<div className="INCIDENT-FORM-PAGE min-h-full bg-base-100">
			<header className="relative isolate flex h-44 flex-col justify-end overflow-hidden bg-primary px-4 pt-4 pb-12">
				<img
					src={bgIncident}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<h1 className="font-title text-2xl font-bold text-accent">
					Nouveau signalement
				</h1>
				<p className="mt-1 text-sm text-white/85">
					Vos voisins concernés seront alertés aussitôt.
				</p>
			</header>

			<div className="relative -mt-8 px-4 pb-6">
				<section className="flex flex-col items-center rounded-3xl bg-base-300 px-6 py-10 text-center">
					<span className="relative flex h-16 w-16 items-center justify-center">
						<span
							className="absolute inset-2 animate-ping rounded-full bg-(--bg-success) [animation-duration:2s]"
							aria-hidden="true"
						/>
						<span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-success)">
							<Icon
								name="check"
								className="block h-6 w-6 fill-success"
								aria-hidden="true"
							/>
						</span>
					</span>

					<h2 className="mt-6 font-title text-2xl font-bold text-primary">
						Signalement créé
					</h2>

					<p className="mt-3 max-w-xs text-sm leading-relaxed text-primary/70">
						Vous pouvez suivre l'évolution de « {incident.title} »
						sur sa fiche détaillée.
					</p>

					<button
						type="button"
						className="btn btn-accent btn-md mt-6 w-full rounded-full border-none px-5 font-bold"
						onClick={() => navigate(`/incident/${incident.id}`)}
					>
						<Icon
							name="arrowSmallRight"
							className="h-4 w-4 fill-primary"
							aria-hidden="true"
						/>
						Voir le signalement
					</button>
				</section>
			</div>
		</div>
	);
}
