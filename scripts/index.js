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

// =================================
// METHOD: resetDom
// =================================
// function resetDom () {
//
// 	// zooqueue.elements("queueCreateForm__serviceCheckboxes").innerHTML = "";
// 	// zooqueue.elements("customerCreateForm__serviceRadios").innerHTML = "";
// 	zooqueue.elements("customerCreateForm__serviceSelect").innerHTML = "";
//
// 	// queue create form service checkboxes
// 	Array.from(zooqueue.elements("queueCreateForm__serviceCheckboxItems").children).forEach( (item, index, arr) => {
// 		if (index > 0) {
// 			item.parentNode.removeChild(item);
// 		}
// 	});
//
// 	// clear queue list items
// 	Array.from(zooqueue.elements("queueSwitchForm").children).forEach( (item, index, arr) => {
// 		if (index > 0) {
// 			item.parentNode.removeChild(item);
// 		}
// 	});
//
// 	// clear staff cards
// 	const staffCards = zooqueue.elements("staffCards");
//
// 	for (let card of Array.from(staffCards.children)) {
// 		if (!card.hasAttribute("template") && !card.hasAttribute("static")) {
// 			card.parentNode.removeChild(card);
// 		}
// 	}
//
//
// 	// for (var i = 0, l = staffCards.children.length; i < l; i++) {
// 	// 	if (staffCards.lastChild.nodeType == 1) {
// 	// 			if (!staffCards.lastChild.hasAttribute("hidden") && !staffCards.lastChild.hasAttribute("static")) {
// 	// 			staffCards.removeChild(staffCards.lastChild);
// 	// 		}
// 	// 	}
// 	// }
//
// 	// clear queue cards
// 	const queueCards = zooqueue.elements("queueCards");
// 	for (let card of Array.from(queueCards.children)) {
// 		if (!card.hasAttribute("template") && !card.hasAttribute("static")) {
// 			card.parentNode.removeChild(card);
// 		}
// 	}
//
// 	zooqueue.consoleLog("resetDom: completed");
// }

// =================================
// METHOD: buildDom
// =================================
// function buildDom (filters = {}) {
//
// 	filters = zooqueue.getFilters();
// 	zooqueue.consoleLog("filters:", filters);
//
// 	resetDom();
//
// 	// service checkboxes for queue create form
// 	if (zooqueue.hasServices()) {
// 		for (let service of zooqueue.getServices()[zooqueue.companyIdAsKey()]) {
// 			buildServiceCheckbox(service);
// 		}
// 	}
//
// 	if (zooqueue.hasQueues()) {
//
// 		// console.log("hasStaff?", zooqueue.hasStaff());
// 		// console.log("hasServices?", zooqueue.hasServices());
//
// 		// ==========================================================
// 		// UPDATE CUSTOMER WAIT TIME ESTIMATES
// 		// ==========================================================
// 		// NOTE: As an isolated problem, this was the most complex
// 		// challenge that I encountered while building ZooQueue
// 		// ==========================================================
// 		zooqueue.setCustomerWaitTimeEstimates();
//
// 		// service options for customer create form...
// 		for (let service of zooqueue.getCurrentQueue().services) {
// 			if (!service.queuing_disabled) {
// 				buildServiceOption(service);
// 			}
// 		}
//
// 		// queues...
// 		let queues = zooqueue.getQueues()[zooqueue.companyIdAsKey()];
// 		for (let queue of queues) {
// 			addQueueListItemToDOM(queue);
// 		}
//
// 		// staff...
// 		let staff = zooqueue.getStaff()[zooqueue.companyIdAsKey()];
// 		let staffBusy = [];
// 		let staffFree = [];
// 		for (let staffMember of staff) {
// 			// ---------------------------------------------------------------------------------
// 			// IMPORTANT: staff member must support at least one service in the current queue
// 			// ---------------------------------------------------------------------------------
// 			if (zooqueue.staffMemberHasServices(staffMember) && !staffMember.queuing_disabled) {
// 				staffMember.attendance_started && staffMember.attendance_status != 1? staffBusy.push(staffMember) : staffFree.push(staffMember);
// 			}
// 		}
// 		staffBusy.sort( (a, b) => {
// 			return luxon.DateTime.fromISO(b.attendance_started).ts - luxon.DateTime.fromISO(a.attendance_started).ts;
// 		});
// 		const shuffledStaff = staffFree.concat(staffBusy);
// 		for (const staffMember of shuffledStaff) {
// 			if ((!filters.staffMember || filters.staffMember.id == staffMember.id) && (!filters.customer || staffMember.service_ids.indexOf(filters.customer.services[0].id) != -1)) {
// 				addStaffCardToDOM(staffMember);
// 			}
// 		}
//
// 		// customers in current queue...
// 		let currentQueue = zooqueue.getCurrentQueue();
// 		for (let customer of currentQueue.customers) {
// 			if ((!filters.staffMember || filters.staffMember.service_ids.indexOf(customer.services[0].id) != -1) && (!filters.customer || filters.customer.id == customer.id)) {
// 				addQueueCardToDOM(customer);
// 			}
// 		}
// 	}
//
// 	setQueueTitleInDOM();
// 	setEventListenersForDynamicContent();
// 	setSuperContainerPositionAndSize();
// 	setLoaded();
//
// 	zooqueue.consoleLog("buildDom: completed");
//
// }
// window.buildDom = buildDom;

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
