import bgIncidentDetails from "@/assets/images/background-incident-details.jpg";
import Icon from "@/components/Icon/Icon";
import SafetyInstructions from "@/components/SafetyInstructions/SafetyInstructions";
import IncidentActions from "@/components/incident/IncidentActions/IncidentActions";
import IncidentContent from "@/components/incident/IncidentContent/IncidentContent";
import IncidentContributions from "@/components/incident/IncidentContributions/IncidentContributions";
import IncidentEditModal from "@/components/incident/IncidentEditModal/IncidentEditModal";
import IncidentHeader from "@/components/incident/IncidentHeader/IncidentHeader";
import IncidentLocation from "@/components/incident/IncidentLocation/IncidentLocation";
import { useAuth } from "@/contexts/AuthContext";
import IncidentDetailsSkeleton from "@/pages/IncidentDetails/IncidentDetailsSkeleton";
import { getIncidentById } from "@/services/incidentService";
import type { Incident } from "@/types/incidentDetails";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

type ViewState =
	| { status: "loading" }
	| { status: "ok"; incident: Incident }
	| { status: "notFound" }
	| { status: "error" };

export default function IncidentDetails() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { id } = useParams();
	const [state, setState] = useState<ViewState>({ status: "loading" });
	const [justSaved, setJustSaved] = useState(false);
	const requestIdRef = useRef(0);
	const editModalRef = useRef<HTMLDialogElement>(null);

	function handleIncidentSaved(updated: Incident) {
		setState({ status: "ok", incident: updated });
		editModalRef.current?.close();
		setJustSaved(true);
	}

	const fetchIncident = useCallback(() => {
		if (id == null) {
			setState({ status: "notFound" });
			return;
		}

		const requestId = ++requestIdRef.current;
		setState({ status: "loading" });

		getIncidentById(id).then((result) => {
			if (requestId !== requestIdRef.current) return;
			setState(
				result.status === "ok"
					? { status: "ok", incident: result.incident }
					: result,
			);
		});
	}, [id]);

	useEffect(() => {
		fetchIncident();
	}, [fetchIncident]);

	if (state.status === "loading") {
		return <IncidentDetailsSkeleton />;
	}

	if (state.status === "notFound") {
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
					<div>
						<h2 className="font-title text-lg font-bold text-primary">
							Incident introuvable
						</h2>
						<p className="mt-2 text-sm text-black">
							Le signalement a été supprimé, ou le lien que vous
							avez suivi n'est pas valide.
						</p>
					</div>
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

	if (state.status === "error") {
		return (
			<div className="flex min-h-dvh flex-col items-center justify-center bg-base-100 p-4">
				<div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-(--bg-error) p-4">
					<div className="flex items-start gap-3">
						<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error">
							<Icon
								name="exclamation"
								className="h-3.5 w-3.5 fill-white"
								aria-hidden="true"
							/>
						</span>
						<div>
							<h2 className="font-title text-lg font-bold text-error">
								Impossible de charger le signalement
							</h2>
							<p className="mt-1 text-sm text-black">
								La connexion au serveur a échoué. Réessayez dans
								un instant.
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={fetchIncident}
							className="btn btn-md grow rounded-full border-none bg-error px-5 font-bold text-white"
						>
							Réessayer
						</button>
						<button
							type="button"
							onClick={() => navigate("/")}
							className="btn btn-md rounded-full border-2 border-error bg-transparent text-error shadow-none hover:bg-error/10 px-5"
						>
							Retour
						</button>
					</div>
				</div>
			</div>
		);
	}

	const { incident } = state;

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
					className="btn btn-square btn-md rounded-xl border-2 border-white bg-white/20 shadow-none hover:bg-white/50"
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
				{incident.status === "in_progress" &&
					user != null &&
					user.id === incident.author.id && (
						<button
							type="button"
							className="btn btn-square btn-md rounded-xl border-none bg-transparent shadow-none hover:bg-white/50"
							aria-label="Éditer l'incident"
							onClick={() => {
								setJustSaved(false);
								editModalRef.current?.showModal();
							}}
						>
							<Icon
								name="pencil"
								className="h-4 w-4 fill-white"
								aria-hidden="true"
							/>
						</button>
					)}
			</header>

			<IncidentEditModal
				dialogRef={editModalRef}
				id={incident.id}
				title={incident.title}
				description={incident.description}
				photoUrl={incident.photoUrl}
				onSaved={handleIncidentSaved}
			/>

			<div className="relative -mt-8 space-y-4 px-4 pb-6">
				{justSaved && (
					<div className="flex w-full items-start gap-3 rounded-2xl bg-accent px-5 py-3 animate-pop">
						<Icon
							name="checkCircle"
							className="h-6 w-6 shrink-0 fill-success"
							aria-hidden="true"
						/>
						<div>
							<p className="text-sm font-bold text-primary">
								Modifications enregistrées
							</p>
							<p className="mt-0.5 text-sm text-primary/70">
								Vos voisins n'ont pas reçu de nouvelle alerte.
							</p>
						</div>
					</div>
				)}

				<section className="rounded-2xl bg-base-300 p-4">
					<IncidentHeader
						dangerLevel={incident.dangerLevel}
						status={incident.status}
						types={incident.types}
						createdAt={incident.createdAt}
						editedAt={incident.editedAt}
						author={incident.author}
					/>
				</section>

				<section>
					<IncidentLocation
						city={incident.city}
						postalCode={incident.postalCode}
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

				<SafetyInstructions incidentTypes={incident.types} />

				<IncidentActions
					status={incident.status}
					expiresAt={incident.expiresAt}
				/>
			</div>
		</div>
	);
}
