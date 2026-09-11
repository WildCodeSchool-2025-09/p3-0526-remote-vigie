import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import bgIncidentDetails from "@/assets/images/background-incident-details.jpg";
import IncidentContent from "@/components/incident/IncidentContent/IncidentContent";
import IncidentContributions from "@/components/incident/IncidentContributions/IncidentContributions";
import IncidentHeader from "@/components/incident/IncidentHeader/IncidentHeader";
import IncidentLocation from "@/components/incident/IncidentLocation/IncidentLocation";
import { getIncidentById } from "@/services/incidentService";
import type { Incident } from "@/types/incidentDetails";
import Icon from "@/components/Icon/Icon";

type ViewState =
	| { status: "loading" }
	| { status: "ok"; incident: Incident }
	| { status: "notFound" }
	| { status: "error" };

export default function IncidentDetails() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [state, setState] = useState<ViewState>({ status: "loading" });

	useEffect(() => {
		if (id == null) {
			setState({ status: "notFound" });
			return;
		}

		let ignore = false;
		setState({ status: "loading" });

		getIncidentById(id).then((result) => {
			if (ignore) return;
			setState(
				result.status === "ok"
					? { status: "ok", incident: result.incident }
					: result,
			);
		});

		return () => {
			ignore = true;
		};
	}, [id]);

	if (state.status === "loading") return <p>Chargement…</p>;
	if (state.status === "notFound") return <p>Signalement introuvable</p>;
	if (state.status === "error") return <p>Erreur</p>;

	const { incident } = state;
	console.log(incident);

	return (
		<div className="INCIDENT-DETAILS-PAGE bg-base-100">
			<header
				className="relative isolate flex h-44 justify-center items-center overflow-hidden px-4 pt-4 pb-12 gap-3"
				style={{
					background: incident.types[0]?.color ?? "var(--primary)",
				}}
			>
				<img
					src={bgIncidentDetails}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 mix-blend-multiply"
				/>
				<button
					type="button"
					className="btn btn-square btn-md rounded-2xl border-2 border-white bg-white/20 shadow-none hover:bg-white/50"
					aria-label="Retour à la carte"
					onClick={() => navigate("/")}
				>
					<Icon
						name="arrowSmallLeft"
						className="h-4 w-4 fill-white"
						aria-hidden="true"
					/>
				</button>
				<h1 className="font-title text-2xl font-bold text-white">
					{incident.title}
				</h1>
			</header>

			<div className="relative -mt-8 space-y-4 px-4 pb-6">
				<section className="rounded-2xl bg-base-300 p-4">
					<IncidentHeader
						dangerLevel={incident.dangerLevel}
						status={incident.status}
						types={incident.types}
						createdAt={incident.createdAt}
						author={incident.author}
					/>
				</section>

				<section>
					<IncidentLocation
						city={incident.city}
						inseeCode={incident.inseeCode}
						latitude={incident.latitude}
						longitude={incident.longitude}
						types={incident.types}
					/>
				</section>

				<IncidentContributions counts={incident.counts} />

				<IncidentContent
					description={incident.description}
					photoUrl={incident.photoUrl}
				/>
			</div>
		</div>
	);
}
