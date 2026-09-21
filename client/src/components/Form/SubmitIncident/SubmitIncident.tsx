type SubmitIncidentProps = {
	submitting: boolean;
};
export default function SubmitIncident({ submitting }: SubmitIncidentProps) {
	return (
		<button
			type="submit"
			className="btn btn-accent btn-md grow w-full rounded-full border-none px-5 font-bold"
			disabled={submitting}
		>
			Signaler l'incident
		</button>
	);
}
