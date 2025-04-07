// paymentsHandler.js (Module Version)
const validSidList = new Set(["19", "20", "21", "22", "23", "24"]);
let previousPathname = window.location.pathname;
let initStylesNavBar;
const route = "/payments";

const centeredStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
};

const commonStyles = {
	opacity: "0",
	top: "0",
	left: "0",
	width: "100vw",
	height: "100vh",
	position: "fixed",
};

const alertBoxStyles = {
	...centeredStyle,
	opacity: "0",
	width: "100%",
	height: "100%",
	transition: "opacity 1s ease",
};

const alertContentStyles = {
	...centeredStyle,
	width: "500px",
	height: "250px",
	color: "black",
	fontSize: "1.5rem",
	background: "white",
	borderRadius: "30px",
	textAlign: "center",
	padding: "20px",
	lineHeight: "1.4",
};

const loaderStyles = {
	opacity: "1",
	zIndex: "2",
	top: "50%",
	left: "50%",
	width: "100px",
	height: "100px",
	borderRadius: "50%",
	position: "absolute",
	border: "12px solid rgba(255, 255, 255, 0.2)",
	borderTop: "12px solid #FF4136",
	animation: "spin 1s linear infinite",
	boxShadow: "0 0 20px rgba(255, 65, 54, 0.8)",
	transform: "translate(-50%, -50%)",
	transition: "opacity 1s ease",
	background: "rgba(0, 0, 0, 0.05)",
};

const overlayStyle = {
	...commonStyles,
	zIndex: "1",
	pointerEvents: "none",
	background: "linear-gradient(107.15deg, #001f3f 0%, #0074D9 56%, #7FDBFF 100%)",
	transition: "opacity 1s ease",
};

const newIframeStyles = {
	...commonStyles,
	zIndex: "2",
	transition: "all 1.5s ease",
};

const sectionStyleInit = {
	width: "50%",
	marginLeft: "0px",
	transform: "translateY(calc(-100% - 50px + 100vh))",
	transition: "all 1s ease",
};

const sectionHandlers = {
	mouseEnter: () => {
		const section = document.querySelector("section");
		if (section) section.style.width = "100%";
	},
	mouseLeave: () => {
		const section = document.querySelector("section");
		if (section) section.style.width = "50%";
	},
};

function getStyleValues(sec) {
	return {
		width: getComputedStyle(sec).width,
		marginLeft: getComputedStyle(sec).marginLeft,
		transform: getComputedStyle(sec).transform,
		transition: getComputedStyle(sec).transition,
	};
}

function applySectionStyles(sec) {
	const pathname = window.location.pathname;

	if (!initStylesNavBar) {
		initStylesNavBar = getStyleValues(sec);
	}

	if (pathname.startsWith(route)) {
		Object.assign(sec.style, initStylesNavBar);
		setTimeout(() => {
			void sec.offsetHeight;
			Object.assign(sec.style, sectionStyleInit);
			sec.addEventListener("mouseenter", sectionHandlers.mouseEnter);
			sec.addEventListener("mouseleave", sectionHandlers.mouseLeave);
		}, 1000);
	} else {
		setTimeout(() => {
			void sec.offsetHeight;
			Object.assign(sec.style, initStylesNavBar);
			sec.removeEventListener("mouseenter", sectionHandlers.mouseEnter);
			sec.removeEventListener("mouseleave", sectionHandlers.mouseLeave);
		}, 1000);
	}
}

function addLoaderAnimation() {
	const style = document.createElement("style");
	style.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }`;
	document.head.appendChild(style);
}

function getUrlParameter(name) {
	const params = new URLSearchParams(window.location.search);
	return params.get(name);
}

function triggerCloneNav() {
	const section = document.querySelector("section");
	section.id = "navBarClone";
	if (section) {
		applySectionStyles(section);
	}
}

function handler() {
	const loader = document.createElement("div");
	const overlay = document.createElement("div");
	const alertBox = document.createElement("div");
	const contentAlert = document.createElement("div");

	loader.id = "loader";
	overlay.id = "overlayIframe";

	const sid = getUrlParameter("sid");
	const iframe = document.getElementById("tunnel");
	const originalSrc = iframe.getAttribute("src");

	iframe.src = "";
	Object.assign(overlay.style, overlayStyle);
	Object.assign(loader.style, loaderStyles);
	Object.assign(iframe.style, newIframeStyles);

	overlay.appendChild(loader);
	iframe.parentElement.appendChild(overlay);

	setTimeout(() => {
		overlay.style.opacity = "1";
	}, 100);

	if (!sid || !validSidList.has(sid)) {
		Object.assign(alertBox.style, alertBoxStyles);
		Object.assign(contentAlert.style, alertContentStyles);
		contentAlert.innerHTML = `🚫 Something went wrong.<br>Please try again.`;
		alertBox.appendChild(contentAlert);

		setTimeout(() => {
			loader.style.opacity = "0";
			overlay.appendChild(alertBox);
			setTimeout(() => {
				loader.remove();
				alertBox.style.opacity = "1";
			}, 500);
		}, 500);
		return;
	}

	setTimeout(() => {
		iframe.src = `${originalSrc}?linkId=${sid}`;
		loader.style.opacity = "0";
		setTimeout(() => {
			loader.remove();
			iframe.style.opacity = "1";
		}, 500);
		overlay.remove();
	}, 500);
}

let debounceTimeout;
const observer = new MutationObserver((mutationsList) => {
	if (debounceTimeout) clearTimeout(debounceTimeout);
	debounceTimeout = setTimeout(() => {
		const iframe = document.getElementById("tunnel");
		if (iframe) {
			observer.disconnect();
			handler();
			triggerCloneNav();
		}
	}, 50);
});

function initPaymentsHandler() {
	window.addEventListener("locationchange", () => {
		const newPathname = window.location.pathname;
		if (document.readyState === "complete") {
			if (previousPathname.startsWith(route) && !newPathname.startsWith(route)) {
				triggerCloneNav();
			} else if (
				!previousPathname.startsWith(route) &&
				newPathname.startsWith(route)
			) {
				observer.observe(document.body, { childList: true, subtree: true });
			}
		}
		previousPathname = newPathname;
	});

	document.addEventListener("DOMContentLoaded", () => {
		addLoaderAnimation();
		const newPathname = window.location.pathname;
		if (newPathname.startsWith(route)) {
			observer.observe(document.body, { childList: true, subtree: true });
		}
		previousPathname = newPathname;
	});
}

export { initPaymentsHandler };
