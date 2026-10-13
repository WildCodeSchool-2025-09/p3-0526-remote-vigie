import type { AuthorBadge } from "@/types/badge";

export type CommentAuthor = {
	// null : compte supprimé
	id: number | null;
	pseudo: string;
	badges: AuthorBadge[];
};

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
