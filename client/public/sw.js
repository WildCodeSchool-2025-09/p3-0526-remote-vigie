// Vigie service worker, served from the site root

const DEFAULT_TITLE = "Vigie";
const DEFAULT_BODY = "Vous avez une nouvelle alerte";
const NOTIFICATION_BADGE = "/push/badge.png";

// Safari revokes the subscription after silent pushes: it must always show
const isSafari =
	/AppleWebKit/.test(navigator.userAgent) &&
	!/Chrome|Chromium|CriOS|Edg|Firefox|FxiOS/.test(navigator.userAgent);

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

function readPayload(event) {
	try {
		return event.data ? event.data.json() : null;
	} catch {
		return null;
	}
}

// Same-origin paths only: "//host" would be read as another site
function safeUrl(url) {
	return typeof url === "string" &&
		url.startsWith("/") &&
		!url.startsWith("//")
		? url
		: "/";
}

// Always yields something to show: a push with nothing displayed would make the
// browser show its own generic notification
function toNotification(payload) {
	if (
		payload == null ||
		typeof payload !== "object" ||
		typeof payload.title !== "string" ||
		payload.title === ""
	) {
		return {
			title: DEFAULT_TITLE,
			options: { body: DEFAULT_BODY, data: { url: "/" } },
		};
	}

	return {
		title: payload.title,
		options: {
			body: typeof payload.body === "string" ? payload.body : "",
			icon: typeof payload.icon === "string" ? payload.icon : undefined,
			data: { url: safeUrl(payload.url) },
		},
	};
}

async function hasVisibleWindow() {
	const windows = await self.clients.matchAll({
		type: "window",
		includeUncontrolled: true,
	});
	return windows.some((client) => client.visibilityState === "visible");
}

self.addEventListener("push", (event) => {
	event.waitUntil(
		(async () => {
			// Vigie is on screen: the app already shows the alert
			if (!isSafari && (await hasVisibleWindow())) return;

			const { title, options } = toNotification(readPayload(event));
			await self.registration.showNotification(title, {
				...options,
				badge: NOTIFICATION_BADGE,
				lang: "fr",
			});
		})(),
	);
});
