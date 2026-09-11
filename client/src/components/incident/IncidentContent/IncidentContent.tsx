type Props = {
	description: string | null;
	photoUrl: string | null;
};

export default function IncidentContent({ description, photoUrl }: Props) {
	return (
		<div className="flex flex-col gap-3">
			{description != null && (
				<p className="text-sm mb-1">{description}</p>
			)}
			{photoUrl != null && (
				<img
					src={photoUrl}
					alt="photographie de l'incident"
					className="rounded-xl"
				/>
			)}
		</div>
	);
}
