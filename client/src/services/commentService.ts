import { apiFetch } from "@/services/apiClient";
import type { Comment } from "@/types/comment";

type GetComments = { status: "ok"; comments: Comment[] } | { status: "error" };

export async function getComments(incidentId: number): Promise<GetComments> {
	try {
		const res = await apiFetch(`/api/incidents/${incidentId}/comments`);

		if (!res.ok) return { status: "error" };

		return { status: "ok", comments: (await res.json()) as Comment[] };
	} catch {
		return { status: "error" };
	}
}

type CreateCommentPayload = {
	content: string;
	quotedCommentId?: number;
};

type CreateComment =
	| { status: "ok"; comment: Comment }
	| { status: "invalid" }
	| { status: "unauthorized" }
	| { status: "notFound" }
	| { status: "resolved" }
	| { status: "error" };

export async function createComment(
	incidentId: number,
	payload: CreateCommentPayload,
): Promise<CreateComment> {
	try {
		const res = await apiFetch(`/api/incidents/${incidentId}/comments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (res.status === 400) return { status: "invalid" };
		if (res.status === 401) return { status: "unauthorized" };
		if (res.status === 404) return { status: "notFound" };
		if (res.status === 409) return { status: "resolved" };
		if (!res.ok) return { status: "error" };

		const comment = (await res.json()) as Comment;
		return { status: "ok", comment };
	} catch {
		return { status: "error" };
	}
}
