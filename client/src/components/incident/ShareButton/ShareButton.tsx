import Icon from "@/components/Icon/Icon";
import type { Incident } from "@/types/incidentDetails";
import buildShareContent from "@/utils/buildShareContent";
import { useState } from "react";

type Props = Pick<Incident, "id" | "types" | "city" | "latitude" | "longitude">;

type ShareState =
	| { status: "idle" }
	| { status: "copied" }
	| { status: "copyFailed"; url: string };

export default function ShareButton(props: Props) {
	const [state, setState] = useState<ShareState>({ status: "idle" });

	async function handleShare() {
		const { title, text, url } = buildShareContent(props);

		if (typeof navigator.share === "function") {
			try {
				await navigator.share({ title, text, url });
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}
				console.error("navigator.share a échoué", error);
			}
			return;
		}

		try {
			await navigator.clipboard.writeText(`${text}\n${url}`);
			setState({ status: "copied" });
		} catch {
			setState({ status: "copyFailed", url });
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<button
				type="button"
				onClick={handleShare}
				aria-label="Partager cet incident"
				className="btn btn-square btn-md rounded-xl border-2 border-primary bg-transparent shadow-none hover:bg-primary/10"
			>
				<Icon
					name="share"
					className="h-4 w-4 fill-primary"
					aria-hidden="true"
				/>
			</button>

			<div aria-live="polite">
				{state.status === "copied" && (
					<p className="flex items-center gap-2 text-sm text-primary/80">
						<Icon
							name="checkCircle"
							className="h-4 w-4 shrink-0 fill-success"
							aria-hidden="true"
						/>
						Lien copié dans le presse-papiers
					</p>
				)}
				{state.status === "copyFailed" && (
					<p className="text-sm text-primary/80">
						Copie impossible. Voici le lien à copier :{" "}
						<a
							href={state.url}
							className="select-all break-all font-semibold underline"
						>
							{state.url}
						</a>
					</p>
				)}
			</div>
		</div>
	);
}
