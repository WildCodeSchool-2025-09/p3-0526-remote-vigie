import usersRepository from "../modules/users/usersRepository";
import mailService from "./mailService";
import { generateVerificationToken, hashToken } from "./verificationToken";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function verificationEmailTemplate({
	pseudo,
	link,
}: {
	pseudo: string;
	link: string;
}) {
	const subject = "Confirmez votre adresse e-mail pour votre compte Vigie";

	const html = `
<div style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; background: #f6f5e9;">
	<div style="background-color:#0b4619; padding: 24px; text-align: center;">
		<img src="${process.env.CLIENT_URL}/vigie-favicon-accent.svg" width="40" height="25" alt="Vigie" style="display:block; margin: 0 auto 8px;">
		<h1 style="font-family: 'Playfair Display', ui-serif, Georgia, serif; color: #ffcc1d; margin: 0; font-size: 20px;">Bienvenue sur Vigie</h1>
	</div>
	<div style="padding: 24px; color: #0b4619;">
		<p>Bonjour ${escapeHtml(pseudo)},</p>
		<p>Merci de confirmer votre adresse e-mail pour activer votre compte Vigie.</p>
		<p style="text-align: center; margin-top: 24px;">
			<a href="${link}" style="background: #ffcc1d; color: #0b4619; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">
				Confirmer mon e-mail
			</a>
		</p>
		<p style="font-size: 13px; color: #0b4619aa;">Ce lien expire dans 24 heures.</p>
	</div>
</div>
`;

	return { subject, html };
}

async function sendVerificationEmail(
	userId: number,
	pseudo: string,
	email: string,
): Promise<void> {
	const verificationToken = generateVerificationToken();
	const verificationTokenHash = hashToken(verificationToken);
	const verificationExpiresAt = new Date(
		Date.now() + VERIFICATION_TOKEN_TTL_MS,
	);

	await usersRepository.setVerificationToken(
		userId,
		verificationTokenHash,
		verificationExpiresAt,
	);

	const link = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
	const { subject, html } = verificationEmailTemplate({ pseudo, link });

	try {
		const previewUrl = await mailService.send({ to: email, subject, html });
		console.log(
			`E-mail de vérification envoyé à ${email}${previewUrl ? ` — aperçu : ${previewUrl}` : ""}`,
		);
	} catch (err) {
		console.error(
			`Échec d'envoi de l'e-mail de vérification à ${email}`,
			err,
		);
	}
}

export default { sendVerificationEmail };
