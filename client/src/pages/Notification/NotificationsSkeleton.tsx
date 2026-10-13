function NotificationSkeletonItem() {
	return (
		<div className=" flex h-26 items-center gap-3 rounded-2xl border border-primary/10 bg-base-300 p-3">
			<div className="flex shrink-0 flex-col items-center gap-1">
				<div className="skeleton size-13 shrink-0 rounded-2xl sm:size-15" />
			</div>
			<div className="min-w-0 grow space-y-2">
				<div className="flex items-center gap-2">
					<div className="skeleton h-4 w-14 rounded-full" />
					<div className="skeleton h-3 w-16 rounded-full" />
				</div>
				<div className="skeleton h-5 w-3/4 rounded" />
				<div className="skeleton h-3 w-1/2 rounded" />
			</div>
			<div className="skeleton size-6 shrink-0 rounded-full" />
		</div>
	);
}

function NotificationsSkeleton({ count = 4 }: { count?: number }) {
	const items = Array.from(
		{ length: count },
		(_, index) => `notification-skeleton-${index}`,
	);

	return (
		<div
			className="relative -mt-8 grid content-start gap-3"
			aria-hidden="true"
		>
			{items.map((key) => (
				<NotificationSkeletonItem key={key} />
			))}
		</div>
	);
}

export default NotificationsSkeleton;
