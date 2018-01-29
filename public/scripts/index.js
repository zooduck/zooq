setLoading();
loginComplete().then((result) => {
	zooqueue.consoleLog(`auth-token: ${result}`);
	// ==============================
	// initialisation code here...
	// ==============================
	Promise.all([bookingbugApis(), zooqueueApi().queuesGet()]).then( (results) => {

		zooqueue.consoleLog("Services from bookingbug api:", JSON.parse(results[0].services));
		zooqueue.consoleLog("People from bookingbug api:", JSON.parse(results[0].people));
		zooqueue.consoleLog("Queues from zooqueue api:", results[1]);

		if (zooqueue.hasQueues()) {
			zooqueue.setCurrentQueueIndex(0);
		}

		bookingbugBookingsApi().then( (result) => {
			setEventListenersForStaticContent(); // once only
			zooqueue.setReady();
			setLoaded();
			zooqueue.consoleLog(zooqueue);
			zooqueue.consoleLog("ALL SYSTEMS ARE GO!");
			buildDom();
		}, err => {
			zooqueue.consoleError(err);
		});

		// ==============================================================================
		// POLL BOOKINGBUG SERVER FOR:
		// 1. NEW BOOKINGS THAT WERE NOT MADE BY ZOOQUEUE
		// 2. STAFF MEMBER UPDATES (SUPPORTED SERVICES CHANGE, NAME CHANGE, EXISTANCE)
		// 3. SERVICE UPDATES (SERVICE NAME CHANGE, QUEUING DISABLED CHANGE, EXISTANCE)
		// ==============================================================================
		setInterval( () => {
			// update time display
			setQueueTitleInDOM();
			Promise.all([bookingbugApis(), bookingbugBookingsApi()]).then( (results) => {
				zooqueue.consolePoll(results);
			}, err => {
				zooqueue.consoleError(err);
			});
		}, zooqueue.bookingbugApi__POLL_DELAY());

		// =============================================
		// REFRESH STAFF AND QUEUE CARDS EACH MINUTE
		// TODO: instead of rebuilding the cards, just
		// update the time data elements instead
		// =============================================
		setInterval( () => {
			const filters = zooqueue.getFilters();
			zooqueue.setEstimatedWaitTimes();
			resetCards();
			buildStaffCards(filters);
			buildQueueCards(filters);
		}, 60000); // each 60 seconds

	}, err => {
		zooqueue.errorLog(err);
	});

});

function clearForm(form) {
	const elements = Array.from(form.elements);
	elements[0].focus();
	for (const el of elements) {
		if (el.type.match(/(text|email)/)) {
			el.value = "";
		}
		if (el.type.match(/checkbox/)) {
			el.checked = false;
		}
	}
}

// ===================================
// EVENT LISTENERS: STATIC CONTENT
// ===================================
function setEventListenersForStaticContent () {

	window.addEventListener("resize", setSuperContainerPositionAndSize);

	// CTRL: SUPER CONTAINER HIDE NAV BAR
	zooqueue.elements("superContainer").addEventListener("click", function (e) {
		navBarHide();
	});

	// CTRLS: SWITCH COLUMNS
	zooqueue.elements("switchColumnsCtrl").addEventListener("click", function (e) {
		let contentColumns__el = zooqueue.elements("contentColumns");
		let contentColumns__children = Array.from(zooqueue.elements("contentColumns").children);
		let farRightCards__el = contentColumns__children.pop();
		if (farRightCards__el.children.length > 1) {
			contentColumns__el.removeChild(contentColumns__el.lastChild);
			contentColumns__el.insertBefore(farRightCards__el, contentColumns__el.childNodes[0]);
		}
	});

	// CTRL: CREATE QUEUE
	zooqueue.elements("queueCreateForm__submitCtrl").addEventListener("click", function (e) {
		const formData = new FormData(zooqueue.elements("queueCreateForm").querySelector("form"));
		const data = zooqueueApi().convertQueueFormDataToJson(formData);

		if (data.error) {
			return zooqueue.consoleError(data.error);
		}

		zooqueueApi().queueCreate(data).then( (result) => {
			clearForm(zooqueue.elements("queueCreateForm").querySelector("form"));
			zooqueue.consoleLog(result);
			// buildDom(); // use pusher instead
		}, err => {
			zooqueue.consoleError(err);
		});
	});

	// CTRL: CREATE CUSTOMER
	zooqueue.elements("customerCreateForm__submitCtrl").addEventListener("click", function (e) {
		if (!zooqueue.hasQueues()) {
			return zooqueue.consoleError("QUEUE_NOT_FOUND");
		}
		const formData = new FormData(zooqueue.elements("customerCreateForm").querySelector("form"));
		const data = zooqueueApi().convertCustomerFormDataToJson(formData);

		if (data.error) {
			return zooqueue.consoleError(data.error);
		}

		zooqueueApi().customerCreate(data).then( (result) => {
			clearForm(zooqueue.elements("customerCreateForm").querySelector("form"));
			zooqueue.consoleLog(result);
			zooqueue.removeFilters(["customer"]);
			// buildDom(); // use pusher instead
		}, err => {
			zooqueue.consoleError(err);
		});
	});

	// CTRL: NAV BAR SWITCH QUEUE
	zooqueue.elements("navBarCtrl__queueSwitch").addEventListener("click", function (e) {

		navBarHide({exceptions:["queueSwitchForm", "navBarCtrl__queueSwitch"]});

		this.classList.toggle("--active");
		zooqueue.elements("queueSwitchForm").classList.toggle("--active");
	});

	// CTRL: NAV BAR CREATE CUSTOMER
	zooqueue.elements("navBarCtrl__customerCreate").addEventListener("click", function (e) {

		navBarHide({exceptions:["customerCreateForm", "navBarCtrl__customerCreate"]});

		this.classList.toggle("--active");
		zooqueue.elements("customerCreateForm").classList.toggle("--active");
		clearForm(zooqueue.elements("customerCreateForm").querySelector("form"));
		// zooqueue.elements("customerCreateForm").querySelector("input").focus();
	});

	// CTRL: NAV BAR CREATE QUEUE
	zooqueue.elements("navBarCtrl__queueCreate").addEventListener("click", function (e) {

		navBarHide({exceptions:["queueCreateForm", "navBarCtrl__queueCreate"]});

		this.classList.toggle("--active");
		zooqueue.elements("queueCreateForm").classList.toggle("--active");
		clearForm(zooqueue.elements("queueCreateForm").querySelector("form"));
		// zooqueue.elements("queueCreateForm").querySelector("input").focus();
	});

	zooqueue.consoleLog("setEventListenersForStaticContent: completed");
}

function navBarHide (rules = { exceptions:[] }) {
	let els = [
		"navBarCtrl__queueSwitch",
		"navBarCtrl__customerCreate",
		"navBarCtrl__queueCreate",
		"queueSwitchForm",
		"queueCreateForm",
		"customerCreateForm"
	];
	for (let el of els) {
		if (rules.exceptions.indexOf(el) == -1) {
			zooqueue.elements(el).classList.remove("--active");
		}
	}
}

// ===================================
// EVENT LISTENERS: DYNAMIC CONTENT
// ===================================
function setEventListenersForDynamicContent () {

	// CTRLS: SWITCH QUEUE
	const form = zooqueue.elements("queueSwitchForm");
	for (const ctrl of Array.from(form.children)) {
		ctrl.addEventListener("click", function() {
			const index = Array.from(form.children).indexOf(ctrl) - 1;
			if (zooqueue.getCurrentQueueIndex() != index) {
				zooqueue.setCurrentQueueIndex(index);
				buildDom();
			}
		});
	}

	zooqueue.consoleLog("setEventListenersForDynamicContent: completed");
}

// =========================================
// METHOD: setSuperContainerSize
// =========================================
function setSuperContainerPositionAndSize() {
	const navBarParentEls = ["navBar", "queueSwitchForm", "customerCreateForm", "queueCreateForm"];
	let superContainerMarginTop = 0;
	navBarParentEls.forEach( (item, index, arr) => {
		if (index == 0) {
			superContainerMarginTop += zooqueue.elements(item).offsetHeight;
		} else superContainerMarginTop -= zooqueue.elements(item).offsetHeight;
	});
	zooqueue.elements("superContainer").style.marginTop = `${superContainerMarginTop}px`;
	zooqueue.elements("superContainer").style.height = `${(window.innerHeight - superContainerMarginTop)}px`;
}
