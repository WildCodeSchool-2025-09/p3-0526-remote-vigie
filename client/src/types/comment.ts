export type CommentAuthor = {
	pseudo: string;
};

export type QuotedComment = {
	author: CommentAuthor;
	content: string;
};

export type Comment = {
	id: number;
	author: CommentAuthor;
	content: string;
	createdAt: string;
	quotedComment: QuotedComment | null;
};
