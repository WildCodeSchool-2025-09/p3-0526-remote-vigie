type SubmitRegisterProps = {
	submitting: boolean;
};

export default function SubmitRegister({ submitting }: SubmitRegisterProps) {
	return (
		<button
			type="submit"
			className="btn btn-accent btn-md grow w-full rounded-full border-none px-5 font-bold"
			disabled={submitting}
		>
			Créer mon compte
		</button>
	);
}
