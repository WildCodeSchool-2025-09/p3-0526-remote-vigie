/**
 * ⚠️ PAGE DE DEV — pas une page de l'app.
 * Route : /help/vigie. Rend le VIGIE.md à la racine du repo, pour un accès visuel sans quitter l'app.
 */

import MarkdownDoc from "@/_dev/MarkdownDoc";
import vigieSource from "../../../VIGIE.md?raw";

export default function VigieViewer() {
	return (
		<MarkdownDoc
			route="/help/vigie"
			label="VIGIE.md (racine du repo)"
			source={vigieSource}
		/>
	);
}
