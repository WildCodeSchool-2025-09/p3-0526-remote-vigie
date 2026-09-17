import type { Comment } from "@/types/comment";

type GetCommentsResult =
	| { status: "ok"; comments: Comment[] }
	| { status: "error" };

export async function getComments(
	incidentId: number,
): Promise<GetCommentsResult> {
	try {
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/api/incidents/${incidentId}/comments`,
		);

		if (!res.ok) return { status: "error" };

		return { status: "ok", comments: (await res.json()) as Comment[] };
	} catch {
		return { status: "error" };
	}
}
