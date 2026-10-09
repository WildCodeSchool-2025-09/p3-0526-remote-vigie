import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

type FlashToastProps = {
	stateKey: string;
	message: string | null;
};

export default function FlashToast({ stateKey, message }: FlashToastProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const [visible, setVisible] = useState(
		(location.state as Record<string, unknown> | null)?.[stateKey] === true,
	);

	useEffect(() => {
		if (!visible) return;
		navigate(location.pathname, { replace: true, state: null });
		const timer = setTimeout(() => setVisible(false), 4000);
		return () => clearTimeout(timer);
	}, [visible, navigate, location.pathname]);

	if (!visible || message == null) return null;

	return (
		<div className="toast toast-top toast-center z-50">
			<output className="rounded-2xl bg-(--bg-success) px-4 py-3 text-sm font-semibold text-primary shadow-md">
				{message}
			</output>
		</div>
	);
}
