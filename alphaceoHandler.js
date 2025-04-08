let initStylesNavBar;
let debounceTimeout;
const route = "/payments";
let previousPathname = window.location.pathname;
const validSidList = new Set(["19", "20", "21", "22", "23", "24"]);

const centeredStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	textAlign: "center",
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
};

const loaderStyles = {
	opacity: "1",
	zIndex: "2",
	top: "50%",
	left: "50%",
	width: "120px",
	height: "120px",
	borderRadius: "50%",
	position: "absolute",
	border: "20px solid rgba(0, 0, 0, 0.1)",
	borderTop: "20px solid rgba(255, 255, 255, 0.6)",
	animation: "spin 1s linear infinite",
	boxShadow: "rgba(255, 255, 255, 0.6) 0px 0px 50px",
	transition: "opacity 1s ease",
};

const overlayStyle = {
	...commonStyles,
	zIndex: "1",
	pointerEvents: "none",
	background:
		"linear-gradient(107.15deg, #001f3f 0%, #0074D9 56%, #7FDBFF 100%)",
	transition: "opacity 1s ease",
};

const newIframeStyles = {
	...commonStyles,
	zIndex: "2",
	transition: "all 1.5s ease",
};

const sectionStyleInit = {
	width: "120px",
	marginLeft: "0px",
	transform: "translateY(calc(-100% - 50px + 100vh))",
	transition: "all 1s ease",
};

const sectionHandlers = {
	mouseEnter: () => {
		const section = document.querySelector("section");
		if (section) section.style.width = initStylesNavBar.width;
	},
	mouseLeave: () => {
		const section = document.querySelector("section");
		const button = document.querySelector(
			"button.w-10.h-10.flex.items-center.justify-center.flex-shrink-0"
		);
		if (section) {
			section.style.width = "120px";
		}
		if (button.nextElementSibling) {
			button.click();
		}
	},
	clickButton: () => {
		const button = document.querySelector(
			"button.w-10.h-10.flex.items-center.justify-center.flex-shrink-0"
		);
		if (button.nextElementSibling) {
			setTimeout(() => {
				button.nextSibling.style.translate = "translateY(-100%)";
			}, 500);
		}
	},
};

function getStyleValues(sec) {
	return {
		width: parseFloat(getComputedStyle(sec).width) + "px",
		marginLeft: parseFloat(getComputedStyle(sec).marginLeft) + "px",
		transform: getComputedStyle(sec).transform,
		transition: getComputedStyle(sec).transition,
	};
}

function applySectionStyles(sec) {
	const pathname = window.location.pathname;
	const button = document.querySelector(
		"button.w-10.h-10.flex.items-center.justify-center.flex-shrink-0"
	);

	if (!initStylesNavBar) {
		initStylesNavBar = getStyleValues(sec);
	}

	if (pathname.startsWith(route)) {
		Object.assign(sec.style, initStylesNavBar);
		setTimeout(() => {
			void sec.offsetHeight;
			Object.assign(sec.style, sectionStyleInit);
		}, 500);
		sec.addEventListener("mouseenter", sectionHandlers.mouseEnter);
		sec.addEventListener("mouseleave", sectionHandlers.mouseLeave);
		button.addEventListener("click", sectionHandlers.clickButton);
		return;
	} else {
		sec.removeEventListener("mouseenter", sectionHandlers.mouseEnter);
		sec.removeEventListener("mouseleave", sectionHandlers.mouseLeave);
		button.removeEventListener("click", sectionHandlers.clickButton);
		setTimeout(() => {
			void sec.offsetHeight;
			sec.style.width = "";
			Object.assign(sec.style, initStylesNavBar);
		}, 500);

		return;
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

const triggerCloneNav = () => {
	const section = document.querySelector("section");
	if (section) {
		applySectionStyles(section);
	}
};

const handler = () => {
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
	}, 500);

	if (!sid || !validSidList.has(sid)) {
		Object.assign(alertBox.style, alertBoxStyles);
		Object.assign(contentAlert.style, alertContentStyles);
		contentAlert.innerText = "🚫 Something went wrong.\nPlease try again.";
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
	} else {
		setTimeout(() => {
			const url = new URL(`${originalSrc}?linkId=${sid}`);
			iframe.src = url;
			loader.style.opacity = "0";
			setTimeout(() => {
				loader.remove();
				iframe.style.opacity = "1";
			}, 500);
			overlay.remove();
		}, 500);
		return;
	}
};

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

(function () {
	const originalReplaceState = history.replaceState;
	const originalPushState = history.pushState;

	function dispatchLocationChange() {
		const event = new Event("locationchange");
		window.dispatchEvent(event);
	}
	history.pushState = function (...args) {
		originalPushState.apply(history, args);
		dispatchLocationChange();
	};
	history.replaceState = function (...args) {
		originalReplaceState.apply(history, args);
		dispatchLocationChange();
	};
})();

function initPaymentsHandler() {

	window.addEventListener("locationchange", () => {
		const newPathname = window.location.pathname;
		if (document.readyState === "complete") {
			if (
				previousPathname.startsWith(route) &&
				!newPathname.startsWith(route)
			) {
                console.log("locationchange NOT runing");
				triggerCloneNav();
			} else if (
				!previousPathname.startsWith(route) &&
				newPathname.startsWith(route)
			) {
                console.log("locationchange runing");
				observer.observe(document.body, { childList: true, subtree: true });
			} else {
				console.log("not runing in same url");
			}
		}
		previousPathname = newPathname;
	});

	window.addEventListener("load", () => {
		const newPathname = window.location.pathname;
		if (
			performance.navigation.type ===
			performance.navigation.TYPE_RELOAD ||
			performance.navigation.type === 
			performance.navigation.TYPE_NAVIGATE
		) {
			console.log("Page was reloaded");
			if (newPathname.startsWith(route)) {
                console.log("load runing");
				observer.observe(document.body, { childList: true, subtree: true });
			}
		}
        previousPathname = newPathname;
	});

	document.addEventListener("DOMContentLoaded", () => {
		const newPathname = window.location.pathname;
		addLoaderAnimation();
        console.log("DOMContentLoaded");
		if (newPathname.startsWith(route)) {
            console.log("DOMContentLoaded runing");
			observer.observe(document.body, { childList: true, subtree: true });
		}
		previousPathname = newPathname;
	});
}

export { initPaymentsHandler };
