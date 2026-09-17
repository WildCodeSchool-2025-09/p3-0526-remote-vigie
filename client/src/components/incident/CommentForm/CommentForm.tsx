import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/AuthContext";
import type { QuoteTarget } from "@/components/incident/CommentList/CommentList";
import { createComment } from "@/services/commentService";
import type { Comment } from "@/types/comment";
import type { IncidentStatus } from "@/types/incidentDetails";
import { useId, useState } from "react";

import type { ChangeEvent, FormEvent } from "react";

const MAX_LENGTH = 500;

type Props = {
	incidentId: number;
	incidentStatus: IncidentStatus;
	quotedComment: QuoteTarget | null;
	onRemoveQuote: () => void;
	onCommentAdded: (comment: Comment) => void;
};

export default function CommentForm({
	incidentId,
	incidentStatus,
	quotedComment,
	onRemoveQuote,
	onCommentAdded,
}: Props) {
	const { user } = useAuth();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const errorId = useId();

	if (incidentStatus === "resolved") {
		return null;
	}

	const isConnected = user != null;

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(event.target.value);
	};

	const isDisabled =
		!isConnected || isSubmitting || content.trim().length === 0;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (isDisabled || user == null) return;

		setIsSubmitting(true);
		setError(null);

		const result = await createComment(incidentId, {
			content: content.trim(),
			quotedCommentId: quotedComment?.id,
		});

		setIsSubmitting(false);

		if (result.status === "ok") {
			onCommentAdded({
				id: result.id,
				author: { pseudo: user.pseudo },
				content: content.trim(),
				createdAt: new Date().toISOString(),
				quotedComment:
					quotedComment == null
						? null
						: {
								author: { pseudo: quotedComment.author },
								content: quotedComment.content,
							},
			});
			setContent("");
			return;
		}

		switch (result.status) {
			case "invalid":
				setError(
					"Votre commentaire est vide ou dépasse 500 caractères.",
				);
				break;
			case "unauthorized":
				setError("Vous devez être connecté pour commenter.");
				break;
			case "notFound":
				setError("Cet incident n'existe plus.");
				break;
			case "resolved":
				setError(
					"Cet incident est résolu, vous ne pouvez plus commenter.",
				);
				break;
			default:
				setError("Une erreur est survenue, réessayez.");
		}
	};

	return (
		<div id="comment-form" className="mt-4">
			{!isConnected && (
				<div className="mb-3 flex items-center gap-3 rounded-2xl bg-base-300 p-3">
					<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--primary-light)">
						<Icon
							name="lock"
							className="h-3.5 w-3.5 fill-primary"
							aria-hidden="true"
						/>
					</span>
					<p className="text-sm text-black">
						Connectez-vous pour commenter ce signalement.
					</p>
				</div>
			)}

			{error != null && (
				<div
					id={errorId}
					role="alert"
					className="mb-3 flex w-full items-start gap-3 rounded-2xl bg-(--bg-error) px-5 py-3"
				>
					<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error">
						<Icon
							name="exclamation"
							className="h-3.5 w-3.5 fill-white"
							aria-hidden="true"
						/>
					</span>
					<p className="text-sm text-error">{error}</p>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="flex items-end gap-3">
					<div className="max-h-40 w-full flex-1 overflow-y-auto rounded-xl border-2 border-primary/15 bg-base-200 px-5 py-3">
						{quotedComment != null && (
							<div className="mb-2 flex items-start justify-between gap-2 border-b border-black/10 pb-2 animate-slide">
								<Icon
									name="quoteRight"
									className="mt-0.5 h-3 w-3 shrink-0 fill-black/40"
									aria-hidden="true"
								/>
								<div className="min-w-0 flex-1">
									<span className="block text-sm font-bold italic text-black/50">
										{quotedComment.author}
									</span>
									<span className="block truncate text-sm italic text-black/50">
										{quotedComment.content}
									</span>
								</div>
								<button
									type="button"
									onClick={onRemoveQuote}
									aria-label="Retirer la citation"
									className="shrink-0 rounded-full p-1 hover:bg-black/5"
								>
									<Icon
										name="crossSmall"
										className="h-4 w-4 fill-black/50"
										aria-hidden="true"
									/>
								</button>
							</div>
						)}

						<textarea
							value={content}
							onChange={handleChange}
							maxLength={MAX_LENGTH}
							placeholder="Écrire un commentaire..."
							rows={1}
							disabled={!isConnected}
							aria-label="Écrire un commentaire"
							aria-describedby={
								error != null ? errorId : undefined
							}
							className="min-h-1 field-sizing-content w-full resize-none border-none bg-transparent p-0 text-black text-sm placeholder:text-black/40 focus:outline-none disabled:opacity-50"
						/>
					</div>

					<button
						type="submit"
						disabled={isDisabled}
						aria-label="Publier le commentaire"
						className="btn btn-circle btn-accent shrink-0 border-none disabled:opacity-50"
					>
						<Icon
							name="paperPlane"
							className="h-4 w-4 fill-primary"
							aria-hidden="true"
						/>
					</button>
				</div>

				<span className="mt-2 block text-right text-xs text-primary/40">
					{content.length} / {MAX_LENGTH} caractères
				</span>
			</form>
		</div>
	);
}
