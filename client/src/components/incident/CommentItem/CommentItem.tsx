import type { Comment } from "@/types/comment";

type Props = {
	comment: Comment;
};

export default function CommentItem({ comment }: Props) {
	return (
		<div>
			<p>{comment.author.pseudo}</p>
			<p>{comment.content}</p>
			<p>{comment.createdAt}</p>
		</div>
	);
}
