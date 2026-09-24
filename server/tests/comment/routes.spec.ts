import supertest from "supertest";

import app from "../../src/app";

// Import the repository whose SQL calls we mock: routes.spec.ts tests the
// HTTP layer (route → action → status/JSON), not the SQL itself.
import commentRepository from "../../src/modules/comment/commentRepository";

afterEach(() => {
	jest.restoreAllMocks();
});

describe("GET /api/incidents/:id/comments", () => {
	it("should fetch comments successfully", async () => {
		const fakeComments = [
			{
				id: 1,
				content: "La route est dégagée.",
				createdAt: new Date("2026-09-20T10:00:00.000Z"),
				author: { pseudo: "yann_30" },
				quotedComment: null,
			},
		];

		jest.spyOn(commentRepository, "readByIncident").mockResolvedValue(
			fakeComments,
		);

		const response = await supertest(app).get("/api/incidents/1/comments");

		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual(
			fakeComments.map((comment) => ({
				...comment,
				createdAt: comment.createdAt.toISOString(),
			})),
		);
	});
});

describe("POST /api/incidents/:id/comments", () => {
	// verifyToken est un bouchon (US06) qui authentifie toujours la requête :
	// on ne peut donc pas encore tester un 401 pour visiteur non connecté par
	// cette route. On teste le premier cas d'erreur réellement atteignable :
	// un contenu vide (ou composé d'espaces) est rejeté avant tout accès base.
	it("should reject an empty comment with 400", async () => {
		const response = await supertest(app)
			.post("/api/incidents/1/comments")
			.send({ content: "   " });

		expect(response.status).toBe(400);
	});
});
