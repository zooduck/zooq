setLoading();
loginComplete().then((result) => {
	zooqueue.consoleLog(`auth-token: ${result}`);
	zooqueueInit();
});

function zooqueueInit() {
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
			Promise.all([bookingbugApis(), bookingbugBookingsApi()]).then( (results) => {
				zooqueue.consolePoll(results);
			}, err => {
				zooqueue.consoleError(err);
			});
		}, zooqueue.bookingbugApi__POLL_DELAY());

		// =============================================
		// REFRESH STAFF AND QUEUE CARDS EACH MINUTE
		// =============================================
		setInterval( () => {
			if (zooqueue.hasQueues()) {
				const filters = zooqueue.getFilters();
				zooqueue.setEstimatedWaitTimes();
				// update time display
				setQueueTitleInDOM();
				// update queue cards
				const customers = zooqueue.getCurrentQueue().customers;
				for (const customer of customers) {
					zooqDOM().updateQueueCard(customer);
				}
				// update staff cards
				const staff = zooqueue.getStaff()[zooqueue.companyIdAsKey()].reverse();
				for (const staffMember of staff) {
					zooqDOM().updateStaffCard(staffMember);
				}
				zooqueue.consoleLogC("60 second refresh: Staff Cards, Queue Cards");
			}
		}, 60000); // each 60 seconds

	}, err => {
		zooqueue.errorLog(err);
	});
}

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
		switchColumnsCtrl__EVENT();
	});
	// ====================
	// CTRL: CREATE QUEUE
	// ====================
	zooqueue.elements("queueCreateForm__submitCtrl").addEventListener("click", function (e) {
		queueCreateForm__submitCtrl__EVENT();
	});

	// ========================
	// CTRL: CREATE CUSTOMER
	// ========================
	zooqueue.elements("customerCreateForm__submitCtrl").addEventListener("click", function (e) {
		customerCreateForm__submitCtrl__EVENT();
	});

	// ============================
	// CTRL: NAV BAR SWITCH QUEUE
	// ============================
	zooqueue.elements("navBarCtrl__queueSwitch").addEventListener("click", function (e) {
		navBarCtrl__queueSwitch__EVENT(this);
	});

  // ===============================
	// CTRL: NAV BAR CREATE CUSTOMER
	// ===============================
	zooqueue.elements("navBarCtrl__customerCreate").addEventListener("click", function (e) {
		navBarCtrl__customerCreate__EVENT(this);
	});

  // ============================
	// CTRL: NAV BAR CREATE QUEUE
	// ============================
	zooqueue.elements("navBarCtrl__queueCreate").addEventListener("click", function (e) {
		navBarCtrl__queueCreate__EVENT(this);
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
				navBarHide();
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
	zooqueue.elements("superContainer").style.height = `${(window.innerHeight - superContainerMarginTop - 5)}px`;
}

// window.addEventListener("resize", setSuperContainerPositionAndSize);
