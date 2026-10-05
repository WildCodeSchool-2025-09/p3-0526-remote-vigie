import type { AuthorBadge } from "@/types/badge";

export type CommentAuthor = {
	id: number;
	pseudo: string;
	// Liste vide pour un visiteur ou un auteur sans badge.
	badges: AuthorBadge[];
};

// Le serveur ne renvoie que le pseudo de l'auteur d'une citation.
export type QuotedCommentAuthor = {
	pseudo: string;
};

export type QuotedComment = {
	author: QuotedCommentAuthor;
	content: string;
};

export type Comment = {
	id: number;
	author: CommentAuthor;
	content: string;
	createdAt: string;
	quotedComment: QuotedComment | null;
};
