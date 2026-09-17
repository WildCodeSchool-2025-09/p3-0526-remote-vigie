import Icon from "@/components/Icon/Icon";
import { useAuth } from "@/contexts/AuthContext";
import type { IncidentStatus } from "@/types/incidentDetails";
import { useState } from "react";

import type { ChangeEvent, FormEvent } from "react";

const MAX_LENGTH = 500;

type Props = {
	incidentStatus: IncidentStatus;
};

export default function CommentForm({ incidentStatus }: Props) {
	const { user } = useAuth();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (incidentStatus === "resolved") {
		return null;
	}

	const isConnected = user != null;

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(event.target.value);
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// TODO : brancher commentService.createComment (prochaine tâche de la checklist)
	};

	const isDisabled =
		!isConnected || isSubmitting || content.trim().length === 0;

	return (
		<div className="mt-4">
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

			<form onSubmit={handleSubmit}>
				<div className="flex items-end gap-3">
					<textarea
						value={content}
						onChange={handleChange}
						maxLength={MAX_LENGTH}
						placeholder="Écrire un commentaire..."
						rows={1}
						disabled={!isConnected}
						aria-label="Écrire un commentaire"
						className="min-h-1 max-h-40 field-sizing-content w-full flex-1 resize-none overflow-y-auto rounded-xl border-2 border-primary/15 bg-base-200 px-5 py-3 text-black text-sm placeholder:text-black/40 focus:outline-none disabled:opacity-50"
					/>

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
