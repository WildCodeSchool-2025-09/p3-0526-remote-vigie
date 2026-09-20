type InputFieldsProps = {
	title: string;
	onTitleChange: (title: string) => void;
};

export default function InputFields({
	title,
	onTitleChange,
}: InputFieldsProps) {
	return (
		<div className="mt-5 flex flex-col gap-1.5">
			<div className="flex items-center justify-between gap-2">
				<label
					htmlFor="incident-edit-title"
					className="mb-1.5 block text-sm font-bold text-primary"
				>
					Titre
				</label>
				<span className="text-xs text-primary/40">
					{title.length} / 150 caractères
				</span>
			</div>
			<input
				id="incident-edit-title"
				type="text"
				value={title}
				placeholder="Ajouter un titre"
				onChange={(e) => onTitleChange(e.target.value)}
				maxLength={150}
				className="w-full rounded-xl border-2 border-primary/15 bg-base-300 px-4 py-3 pr-8 text-black placeholder:text-black/40 focus:outline-none"
			/>
		</div>
	);
}
