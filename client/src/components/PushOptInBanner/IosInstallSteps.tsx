export default function IosInstallSteps() {
	return (
		<>
			<p className="mt-1 text-sm text-primary/70">
				Sur iPhone et iPad, les notifications ne fonctionnent que si
				Vigie est ajouté à l'écran d'accueil :
			</p>
			<ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-primary/70">
				<li>
					Touchez le bouton <strong>Partager</strong> (le carré avec
					une flèche vers le haut).
				</li>
				<li>
					Choisissez <strong>« Sur l'écran d'accueil »</strong>.
				</li>
				<li>
					Touchez <strong>Ajouter</strong>, puis ouvrez Vigie depuis
					sa nouvelle icône.
				</li>
			</ol>
			<p className="mt-2 text-sm text-primary/70">
				Vous devrez vous reconnecter dans l'application installée, puis
				activer les notifications.
			</p>
		</>
	);
}
