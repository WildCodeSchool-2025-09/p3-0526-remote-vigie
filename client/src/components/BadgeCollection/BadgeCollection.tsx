import Icon from "@/components/Icon/Icon";
import type { Badge } from "@/types/badge";

type BadgeCollectionProps = {
	badges: Badge[];
};

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({
	current,
	target,
}: { current: number; target: number }) {
	const ratio = target > 0 ? Math.min(current / target, 1) : 0;

	return (
		<svg
			viewBox="0 0 80 80"
			aria-hidden="true"
			className="absolute inset-0 size-full -rotate-90"
		>
			<circle
				cx="40"
				cy="40"
				r={RING_RADIUS}
				fill="none"
				strokeWidth="4"
				className="stroke-base-100"
			/>
			{ratio > 0 && (
				<circle
					cx="40"
					cy="40"
					r={RING_RADIUS}
					fill="none"
					strokeWidth="4"
					strokeLinecap="round"
					strokeDasharray={`${ratio * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
					className="stroke-secondary"
				/>
			)}
		</svg>
	);
}

function BadgeItem({ badge }: { badge: Badge }) {
	const { progress } = badge;

	return (
		<li className="flex items-center gap-3 rounded-2xl bg-base-300 p-3">
			<div className="relative size-20 shrink-0">
				{progress && (
					<ProgressRing
						current={progress.current}
						target={progress.target}
					/>
				)}
				<img
					src={`/badges-png/${badge.icon}`}
					alt=""
					className={`absolute inset-3 size-14 object-contain ${
						progress ? "grayscale opacity-60" : ""
					}`}
				/>
			</div>

			<div className="min-w-0">
				<h3 className="font-title font-bold text-primary">
					{badge.label}
				</h3>
				<p className="text-sm text-black/70">{badge.description}</p>
				<p className="mt-1 flex items-center gap-1 text-xs font-bold text-primary">
					{progress ? (
						`En cours · ${progress.current}/${progress.target}`
					) : (
						<>
							<Icon
								name="check"
								className="h-3 w-3 fill-success"
								aria-hidden="true"
							/>
							Obtenu
						</>
					)}
				</p>
			</div>
		</li>
	);
}

function BadgeSection({ title, badges }: { title: string; badges: Badge[] }) {
	return (
		<section>
			<h2 className="mb-3 font-title text-lg font-bold text-primary">
				{title} · {badges.length}
			</h2>
			<ul className="flex flex-col gap-3">
				{badges.map((badge) => (
					<BadgeItem key={badge.code} badge={badge} />
				))}
			</ul>
		</section>
	);
}

export default function BadgeCollection({ badges }: BadgeCollectionProps) {
	const earned = badges.filter((badge) => badge.earnedAt !== null);
	const toEarn = badges.filter((badge) => badge.earnedAt === null);

	return (
		<div className="flex flex-col gap-6">
			{earned.length > 0 && (
				<BadgeSection title="Obtenus" badges={earned} />
			)}
			{toEarn.length > 0 && (
				<BadgeSection title="À obtenir" badges={toEarn} />
			)}
		</div>
	);
}
