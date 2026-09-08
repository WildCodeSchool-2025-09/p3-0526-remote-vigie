import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getIncidentById } from "@/services/incidentService";
import type { Incident } from "@/types/incident";

type ViewState =
	| { status: "loading" }
	| { status: "ok"; incident: Incident }
	| { status: "notFound" }
	| { status: "error" };

export default function IncidentDetails() {
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

	return (
		<div className="INCIDENT-DETAILS-PAGE">
			<h1>{incident.title}</h1>
		</div>
	);
}
