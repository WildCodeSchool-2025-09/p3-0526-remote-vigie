import Icon from "@/components/Icon/Icon";

type ApocalypseSurpriseProps = {
	onDismiss: () => void;
};

export default function ApocalypseSurprise({
	onDismiss,
}: ApocalypseSurpriseProps) {
	return (
		<button
			type="button"
			onClick={onDismiss}
			className="flex w-full flex-col items-center gap-4 overflow-hidden rounded-2xl bg-primary px-6 py-8 motion-safe:animate-impact"
		>
			<span className="font-title text-3xl font-bold text-accent motion-safe:animate-title-pop">
				Apocalypse !
			</span>

			<span className="relative block h-32 w-32" aria-hidden="true">
				<Icon
					name="meteor"
					className="absolute inset-0 h-full w-full motion-safe:animate-meteor-fall motion-reduce:hidden"
				/>
				<img
					src="/badges-png/07-apocalypse.png"
					alt=""
					className="absolute inset-0 h-full w-full motion-safe:animate-badge-pop"
				/>
			</span>

			<span className="text-sm text-white/85">
				Touchez pour revenir à la liste des types
			</span>
		</button>
	);
}
