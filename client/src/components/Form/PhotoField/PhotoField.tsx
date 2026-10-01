import Icon from "@/components/Icon/Icon";

type Props = {
	value: string | null;
	onChange: (value: string | null) => void;
};

export default function PhotoField({ value, onChange }: Props) {
	return (
		<div className="mt-4 flex flex-col gap-1.5 mb-5">
			<p className="mb-1.5 block text-sm font-bold text-primary">Photo</p>
			{value ? (
				<div className="relative overflow-hidden rounded-xl">
					<img
						src={value}
						alt="Aperçu actuel du signalement"
						className="w-full object-cover"
					/>
					<div className="absolute top-2 right-2 flex gap-2">
						<button
							type="button"
							className="btn btn-square btn-sm rounded-xl border-none bg-black/40 shadow-none hover:bg-black/60"
							aria-label="Remplacer la photo"
						>
							<Icon
								name="pencil"
								className="h-3 w-3 fill-white"
								aria-hidden="true"
							/>
						</button>
						<button
							type="button"
							onClick={() => onChange(null)}
							className="btn btn-square btn-sm rounded-xl border-none bg-black/40 shadow-none hover:bg-black/60"
							aria-label="Supprimer la photo"
						>
							<Icon
								name="crossSmall"
								className="h-5 w-5 fill-white"
								aria-hidden="true"
							/>
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/20 bg-transparent py-6 text-sm font-bold text-primary/60 hover:bg-primary/5"
				>
					<Icon
						name="camera"
						className="h-5 w-5 fill-primary/40"
						aria-hidden="true"
					/>
					Ajouter une photo
				</button>
			)}
		</div>
	);
}
