import jwt from "jsonwebtoken";

export function signAuthToken(userId: number): string {
	return jwt.sign(
		{ sub: String(userId), isAdmin: false },
		process.env.APP_SECRET as string,
		{
			expiresIn: "1h",
		},
	);
}

export function verifyAuthToken(
	token: string,
): { sub: string; isAdmin: boolean } | null {
	try {
		return jwt.verify(token, process.env.APP_SECRET as string) as {
			sub: string;
			isAdmin: boolean;
		};
	} catch {
		return null;
	}
}
