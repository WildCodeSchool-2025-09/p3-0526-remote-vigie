import CommentItem from "@/components/incident/CommentItem/CommentItem";
import { getComments } from "@/services/commentService";
import type { Comment } from "@/types/comment";
import { useEffect, useState } from "react";

type Props = {
	incidentId: number;
};

export default function CommentList({ incidentId }: Props) {
	const [comments, setComments] = useState<Comment[]>([]);

	useEffect(() => {
		getComments(incidentId).then((result) => {
			if (result.status === "ok") {
				setComments(result.comments);
			}
		});
	}, [incidentId]);

	return (
		<div>
			<h2 className="font-title text-lg font-bold text-primary">
				Commentaires
			</h2>

			{comments.map((comment) => (
				<CommentItem key={comment.id} comment={comment} />
			))}
		</div>
	);
}
