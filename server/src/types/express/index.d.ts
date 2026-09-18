export type {};

declare global {
	namespace Express {
		export interface Request {
<<<<<<< HEAD
			/* ************************************************************************* */
			// Add your custom properties here, for example:
			//
			// user?: { ... }
			/* ************************************************************************* */
			user?: { id: number };
=======
			auth?: { sub: string; isAdmin: boolean };
>>>>>>> origin/dev
		}
	}
}
