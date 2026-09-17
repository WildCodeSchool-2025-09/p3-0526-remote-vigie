import Icon from "@/components/Icon/Icon";
import CommentForm from "@/components/incident/CommentForm/CommentForm";
import CommentItem from "@/components/incident/CommentItem/CommentItem";
import { getComments } from "@/services/commentService";
import type { Comment } from "@/types/comment";
import type { IncidentStatus } from "@/types/incidentDetails";
import { useEffect, useState } from "react";

type Props = {
	incidentId: number;
	incidentStatus: IncidentStatus;
};

export default function CommentList({ incidentId, incidentStatus }: Props) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [newCommentIds, setNewCommentIds] = useState<Set<number>>(new Set());

	useEffect(() => {
		getComments(incidentId).then((result) => {
			if (result.status === "ok") {
				setComments(result.comments);
			}
		});
	}, [incidentId]);

	return (
		<div>
			<div className="flex items-baseline justify-between mb-4">
				<h2 className="font-title text-lg font-bold text-primary">
					Commentaires
				</h2>
				<span className="text-xs text-primary/50">
					{comments.length}{" "}
					{comments.length > 1 ? "messages" : "message"}
				</span>
			</div>

			{comments.length === 0 ? (
				<div className="flex flex-col items-center gap-4 rounded-3xl bg-base-300 p-4 text-center">
					<span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--primary-light)">
						<Icon
							name="commentAltMiddle"
							className="h-8 w-8 fill-primary"
							aria-hidden="true"
						/>
					</span>
					<div>
						<h2 className="font-title text-lg font-bold text-primary">
							Aucun commentaire pour l'instant
						</h2>
						<p className="mt-2 text-sm text-black">
							Soyez le premier à donner une nouvelle de la
							situation : vos voisins vous liront.
						</p>
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{comments.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							incidentStatus={incidentStatus}
							isNewComment={newCommentIds.has(comment.id)}
						/>
					))}
				</div>
			)}

			<CommentForm
				incidentId={incidentId}
				incidentStatus={incidentStatus}
				onCommentAdded={(comment) => {
					setComments((current) => [...current, comment]);
					setNewCommentIds(
						(current) => new Set(current).add(comment.id),
					);
				}}
			/>
		</div>
	);
}
