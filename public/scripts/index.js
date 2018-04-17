setLoading();
loginComplete().then((result) => {
	zooq.consoleLog(`auth-token: ${result}`);
	zooqueueInit();
});

function zooqueueInit() {
	// ==============================
	// initialisation code here...
	// ==============================
	Promise.all([bookingbugApis(), zooqApi().queuesGet()]).then( (results) => {

		zooq.consoleLog("Services from bookingbug api:", JSON.parse(results[0].services));
		zooq.consoleLog("People from bookingbug api:", JSON.parse(results[0].people));
		zooq.consoleLog("Queues from zooqueue api:", results[1]);

		if (zooq.hasQueues()) {
			zooq.setCurrentQueueIndex(0);
		}

		bookingbugBookingsApi().then( (result) => {
			setEventListenersForStaticContent(); // once only
			zooq.setReady();
			setLoaded();
			zooq.consoleLog(zooq);
			zooq.consoleLog("ALL SYSTEMS ARE GO!");
			buildDom();
		}, err => {
			zooq.consoleError(err);
		});

		// ==============================================================================
		// POLL BOOKINGBUG SERVER FOR:
		// 1. NEW BOOKINGS THAT WERE NOT MADE BY ZOOQUEUE
		// 2. STAFF MEMBER UPDATES (SUPPORTED SERVICES CHANGE, NAME CHANGE, EXISTANCE)
		// 3. SERVICE UPDATES (SERVICE NAME CHANGE, QUEUING DISABLED CHANGE, EXISTANCE)
		// ==============================================================================
		setInterval( () => {
			Promise.all([bookingbugApis(), bookingbugBookingsApi()]).then( (results) => {
				zooq.consolePoll(results);
			}, err => {
				zooq.consoleError(err);
			});
		}, zooq.bookingbugApi__POLL_DELAY());

		// =============================================
		// REFRESH STAFF AND QUEUE CARDS EACH MINUTE
		// =============================================
		setInterval( () => {
			if (zooq.hasQueues()) {
				const filters = zooq.getFilters();
				zooq.setEstimatedWaitTimes();
				// update time display
				setQueueTitleInDOM();
				// update queue cards
				const customers = zooq.getCurrentQueue().customers;
				for (const customer of customers) {
					zooqDOM().updateQueueCard(customer);
				}
				// update staff cards
				const staff = zooq.getStaff()[zooq.companyIdAsKey()];
				for (const staffMember of Array.from(staff).reverse()) {
					zooqDOM().updateStaffCard(staffMember, false);
				}
				zooq.consoleLogC("60 second refresh: Staff Cards, Queue Cards");
			}
		}, 60000); // each 60 seconds

	}, err => {
		zooq.errorLog(err);
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
	zooq.elements("superContainer").addEventListener("click", function (e) {
		navBarHide();
	});

	// CTRLS: SWITCH COLUMNS
	zooq.elements("switchColumnsCtrl").addEventListener("click", function (e) {
		switchColumnsCtrl__EVENT();
	});
	// ====================
	// CTRL: CREATE QUEUE
	// ====================
	zooq.elements("queueCreateForm__submitCtrl").addEventListener("click", function (e) {
		queueCreateForm__submitCtrl__EVENT();
	});

	// ========================
	// CTRL: CREATE CUSTOMER
	// ========================
	zooq.elements("customerCreateForm__submitCtrl").addEventListener("click", function (e) {
		customerCreateForm__submitCtrl__EVENT();
	});

	// ============================
	// CTRL: NAV BAR SWITCH QUEUE
	// ============================
	zooq.elements("navBarCtrl__queueSwitch").addEventListener("click", function (e) {
		navBarCtrl__queueSwitch__EVENT(this);
	});

  // ===============================
	// CTRL: NAV BAR CREATE CUSTOMER
	// ===============================
	zooq.elements("navBarCtrl__customerCreate").addEventListener("click", function (e) {
		navBarCtrl__customerCreate__EVENT(this);
	});

  // ============================
	// CTRL: NAV BAR CREATE QUEUE
	// ============================
	zooq.elements("navBarCtrl__queueCreate").addEventListener("click", function (e) {
		navBarCtrl__queueCreate__EVENT(this);
	});

	zooq.consoleLog("setEventListenersForStaticContent: completed");
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
			zooq.elements(el).classList.remove("--active");
		}
	}
}

// =========================================
// METHOD: setSuperContainerSize
// =========================================
function setSuperContainerPositionAndSize() {
	const navBarParentEls = ["navBar", "queueSwitchForm", "customerCreateForm", "queueCreateForm"];
	let superContainerMarginTop = 0;
	navBarParentEls.forEach( (item, index, arr) => {
		if (index == 0) {
			superContainerMarginTop += zooq.elements(item).offsetHeight;
		} else superContainerMarginTop -= zooq.elements(item).offsetHeight;
	});
	zooq.elements("superContainer").style.marginTop = `${superContainerMarginTop}px`;
	zooq.elements("superContainer").style.height = `${(window.innerHeight - superContainerMarginTop - 5)}px`;
}
// ==========================================
// HIDE NAV BAR FORMS WHEN ESC KEY PRESSED
// ==========================================
window.addEventListener("keyup", (e) => {
	const key = e.which || e.keyCode;
	if (key == 27) {
		navBarHide();
	}
});

// window.addEventListener("resize", setSuperContainerPositionAndSize);
