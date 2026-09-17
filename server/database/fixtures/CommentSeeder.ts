import AbstractSeeder from "./AbstractSeeder";
import IncidentSeeder from "./IncidentSeeder";
import UserSeeder from "./UserSeeder";

class CommentSeeder extends AbstractSeeder {
	constructor() {
		// Call the constructor of the parent class (AbstractSeeder) with appropriate options
		super({
			table: "comment",
			truncate: true,
			dependencies: [IncidentSeeder, UserSeeder],
		});
	}

	async run() {
		for (let i = 0; i < 12; i += 1) {
			const incidentIndex = i % 10;

			// Generate fake comment data matching the `comment` table columns
			const fakeComment = {
				refName: `comment_${i}`,
				user_id: this.getRef(`user_${(i + 2) % 10}`).insertId,
				incident_id: this.getRef(`incident_${incidentIndex}`).insertId,
				content: this.faker.lorem.sentence({ min: 5, max: 12 }),
				...(i === 10 && {
					quoted_comment_id: this.getRef("comment_0").insertId,
				}),
				...(i === 11 && {
					quoted_comment_id: this.getRef("comment_1").insertId,
				}),
			};

			// Insert the fakeComment data into the 'comment' table
			this.insert(fakeComment);
			await this.promises.at(-1);
		}
	}
}

export default CommentSeeder;
