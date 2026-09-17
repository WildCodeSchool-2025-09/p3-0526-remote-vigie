/**
 * ⚠️ PAGE DE DEV — pas une page de l'app.
 * Route : /help/readme. Rend le README.md à la racine du repo (contenu live, y compris les
 * diagrammes mermaid), pour un accès visuel sans quitter l'app.
 */

import MarkdownDoc from "@/_dev/MarkdownDoc";
import readmeSource from "../../../README.md?raw";

export default function ReadmeViewer() {
	return (
		<MarkdownDoc
			route="/help/readme"
			label="README.md (racine du repo)"
			source={readmeSource}
		/>
	);
}
