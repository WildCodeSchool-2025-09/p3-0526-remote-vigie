import { commentPayload, mentionPayload } from "./pushPayloads";
import pushService from "./pushService";

// Same rules as the notification center: nobody is notified of their own
// comment, and an incident owner who is also the quoted author gets only the
// "comment" notification, not a second one for the same event.
async function notify({
	incidentId,
	city,
	ownerId,
	authorId,
	quotedAuthorId,
}: {
	incidentId: number;
	city: string | null;
	ownerId: number;
	authorId: number;
	quotedAuthorId: number | null;
}): Promise<void> {
	const sends: Promise<unknown>[] = [];

	if (ownerId !== authorId) {
		sends.push(
			pushService.send(ownerId, commentPayload({ incidentId, city })),
		);
	}

	if (
		quotedAuthorId != null &&
		quotedAuthorId !== authorId &&
		quotedAuthorId !== ownerId
	) {
		sends.push(
			pushService.send(
				quotedAuthorId,
				mentionPayload({ incidentId, city }),
			),
		);
	}

	await Promise.all(sends);
}

export default { notify };
