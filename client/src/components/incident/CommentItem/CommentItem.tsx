import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/AuthContext";
import type { Comment } from "@/types/comment";
import type { IncidentStatus } from "@/types/incidentDetails";
import { formatDateTime } from "@/utils/formatDate";
import { useState } from "react";

type Props = {
	comment: Comment;
	incidentStatus: IncidentStatus;
	isNewComment?: boolean;
};

export default function CommentItem({
	comment,
	incidentStatus,
	isNewComment = false,
}: Props) {
	const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
	const { user } = useAuth();

	return (
		<div
			className={`rounded-2xl border-l-4 border-secondary bg-base-300 py-2 px-4 ${
				isNewComment ? "animate-pop" : ""
			}`}
		>
			<div className="flex items-baseline justify-between gap-2">
				<span className="font-bold text-sm text-primary">
					{comment.author.pseudo}
				</span>
				<span className="text-xs text-primary/50">
					{formatDateTime(comment.createdAt)}
				</span>
			</div>

			{comment.quotedComment && (
				<button
					type="button"
					onClick={() => setIsQuoteExpanded((expanded) => !expanded)}
					className="mt-2 block w-full rounded-xl border-l-4 border-base-100 bg-base-200 p-2 text-left cursor-pointer"
				>
					<span className="block text-sm font-bold text-black/50">
						{comment.quotedComment.author.pseudo}
					</span>
					<span
						className={`block text-sm text-black/50 ${
							isQuoteExpanded ? "" : "truncate"
						}`}
					>
						{comment.quotedComment.content}
					</span>
					<span className="text-xs font-bold text-secondary">
						{isQuoteExpanded ? "Replier" : "Déplier"}
					</span>
				</button>
			)}

			<p className="mt-2 text-sm text-black">{comment.content}</p>

			{user != null && incidentStatus === "in_progress" && (
				<button
					type="button"
					className="btn btn-xs mt-3 rounded-full border-2 border-primary/15 bg-transparent text-primary shadow-none hover:bg-primary/10 px-3 gap-1"
				>
					<Icon
						name="quoteRight"
						className="h-3 w-3 fill-primary"
						aria-hidden="true"
					/>
					Citer
				</button>
			)}
		</div>
	);
}
