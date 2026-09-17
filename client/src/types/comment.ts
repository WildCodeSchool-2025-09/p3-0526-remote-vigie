export type CommentAuthor = {
	pseudo: string;
};

export type Comment = {
	id: number;
	author: CommentAuthor;
	content: string;
	createdAt: string;
};
