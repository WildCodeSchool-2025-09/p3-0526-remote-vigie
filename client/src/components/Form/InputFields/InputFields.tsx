type InputFieldsProps = {
	title: string;
	onTitleChange: (title: string) => void;
	placeholder: string;
	description: string;
	onDescriptionChange: (description: string) => void;
};

export default function InputFields({
	title,
	onTitleChange,
	placeholder,
	description,
	onDescriptionChange,
}: InputFieldsProps) {
	return (
		<>
			<div className="mt-5 flex flex-col gap-1.5">
				<div className="flex items-center justify-between gap-2">
					<label
						htmlFor="incident-edit-title"
						className="mb-1.5 block text-sm font-bold text-primary"
					>
						Titre
					</label>
					<span className="text-xs text-primary/40">
						{title.length} / 80 caractères
					</span>
				</div>
				<input
					id="incident-edit-title"
					type="text"
					value={title}
					placeholder={placeholder}
					onChange={(e) => onTitleChange(e.target.value)}
					maxLength={80}
					className="w-full rounded-xl border border-primary/15 bg-base-300 px-4 py-3 pr-8 text-black placeholder:text-black/40 focus:outline-none"
				/>
			</div>
			<div className="mt-4 flex flex-col gap-1.5">
				<div className="flex items-center justify-between gap-2">
					<label
						htmlFor="incident-edit-description"
						className="mb-1.5 block text-sm font-bold text-primary"
					>
						Description
					</label>
					<span className="text-xs text-primary/40">
						{description.length} / 500 caractères
					</span>
				</div>
				<textarea
					id="incident-edit-description"
					rows={4}
					value={description}
					placeholder="Ajouter une description (facultatif)"
					onChange={(e) => onDescriptionChange(e.target.value)}
					maxLength={500}
					className="w-full resize-none rounded-xl border border-primary/15 bg-base-300 px-5 py-4 text-black placeholder:text-black/40 focus:outline-none"
				/>
			</div>
		</>
	);
}
