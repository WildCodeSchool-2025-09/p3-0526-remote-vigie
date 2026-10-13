import { resolvePhotoUrl } from "@/utils/photoUrl";

type Props = {
	description: string | null;
	photoUrl: string | null;
};

export default function IncidentContent({ description, photoUrl }: Props) {
	return (
		<div className="flex flex-col gap-3">
			{description && <p className="text-sm mb-1">{description}</p>}
			{photoUrl && (
				<img
					src={resolvePhotoUrl(photoUrl)}
					alt="photographie de l'incident"
					className="rounded-xl"
				/>
			)}
		</div>
	);
}
