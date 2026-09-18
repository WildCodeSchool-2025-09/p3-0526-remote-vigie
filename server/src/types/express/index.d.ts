export type {};

declare global {
	namespace Express {
		export interface Request {
			auth?: { sub: string; isAdmin: boolean };
		}
	}
}
