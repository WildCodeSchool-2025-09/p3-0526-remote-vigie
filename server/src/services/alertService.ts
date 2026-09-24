import addressRepository from "../modules/address/addressRepository";
import mailService from "./mailService";
import withPreposition from "./title";

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function emailTemplate({
	type,
	city,
	postalCode,
	latitude,
	longitude,
	date,
	address,
	link,
}: {
	type: string[];
	city: string | null;
	postalCode: string | null;
	latitude: string;
	longitude: string;
	date: Date;
	address: string;
	link: string;
}) {
	const place = city
		? `${withPreposition(city)}${postalCode ? ` (${postalCode})` : ""}`
		: `aux coordonnées ${latitude}, ${longitude}`;

	const formattedDate = `${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString(
		"fr-FR",
		{ hour: "2-digit", minute: "2-digit" },
	)}`;

	const subject = `Nouveau signalement : ${type.join(", ")} ${place}`;

	const html = `
<div style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; background: #f6f5e9;">
	<div style="background-color:#0b4619; background-image:url('${process.env.CLIENT_URL}/background-incident.jpg'); background-size:cover; background-position:center; background-blend-mode:multiply; padding: 24px; text-align: center;">
		<img src="${process.env.CLIENT_URL}/vigie-favicon-accent.svg" width="40" height="25" alt="Vigie" style="display:block; margin: 0 auto 8px;">
		<h1 style="font-family: 'Playfair Display', ui-serif, Georgia, serif; color: #ffcc1d; margin: 0; font-size: 20px;">Vigie vous alerte</h1>
	</div>
	<div style="padding: 24px; color: #0b4619;">
		<p>Un signalement de type ${type.join(", ")} a été fait ${place}, le ${formattedDate}.</p>
		<p style="background: #f6f5e9; border-left: 4px solid #ffcc1d; padding: 12px;">
			Adresse concernée : <strong>${escapeHtml(address)}</strong>
		</p>
		<p style="text-align: center; margin-top: 24px;">
			<a href="${link}" style="background: #ffcc1d; color: #0b4619; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">
				Voir le signalement
			</a>
		</p>
	</div>
</div>
`;

	return { subject, html };
}

async function dispatch({
	incidentId,
	types,
	city,
	postalCode,
	latitude,
	longitude,
	createdAt,
	radiusMeters,
	authorUserId,
}: {
	incidentId: number;
	types: string[];
	city: string | null;
	postalCode: string | null;
	latitude: string;
	longitude: string;
	createdAt: Date;
	radiusMeters: number;
	authorUserId: number;
}) {
	const recipients = await addressRepository.findAddressesInRadius(
		Number(longitude),
		Number(latitude),
		radiusMeters,
		authorUserId,
	);

	if (recipients.length === 0) return;

	const link = `${process.env.CLIENT_URL}/incident/${incidentId}`;

	for (const recipient of recipients) {
		const address =
			recipient.label ?? recipient.street_line ?? "votre adresse";

		const { subject, html } = emailTemplate({
			type: types,
			city,
			postalCode,
			latitude,
			longitude,
			date: createdAt,
			address,
			link,
		});

		try {
			const previewUrl = await mailService.send({
				to: recipient.email,
				subject,
				html,
			});
			console.log(
				`Alerte envoyée à ${recipient.email} pour l'incident ${incidentId}${
					previewUrl ? ` — aperçu : ${previewUrl}` : ""
				}`,
			);
		} catch (err) {
			console.error(
				`Échec d'envoi de l'alerte à ${recipient.email} pour l'incident ${incidentId}`,
				err,
			);
		}
	}
}

export default { dispatch };
