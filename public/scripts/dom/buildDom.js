function buildDom (filters = {}) {

	filters = zooqueue.getFilters();

	resetDom();

	if (zooqueue.hasServices()) {
    // =============================================
    // QUEUE CREATE FORM: BUILD SERVICE CHECKBOXES
    // =============================================
		for (let service of zooqueue.getServices()[zooqueue.companyIdAsKey()]) {
			buildServiceCheckbox(service);
		}
	}
	if (zooqueue.hasQueues()) {
		// ======================================
		// CUSTOMER WAIT TIME ESTIMATES: RECALC
		// ======================================
		// zooqueue.setCustomerWaitTimeEstimates();
		zooqueue.setEstimatedWaitTimes();

    // ===========================================================
    // CUSTOMER CREATE FORM: BUILD SERVICE OPTIONS FOR <select>
    // ===========================================================
		for (let service of zooqueue.getCurrentQueue().services) {
			if (!service.queuing_disabled) {
				buildServiceOption(service);
			}
		}
    // ======================================
    // QUEUE LIST: BUILD QUEUE LIST LINKS
    // ======================================
		let queues = zooqueue.getQueues()[zooqueue.companyIdAsKey()];
		for (let queue of queues) {
			addQueueListItemToDOM(queue);
		}

		buildStaffCards(filters);
		buildQueueCards(filters);

    // ===========================
    // STAFF CARDS: BUILD ITEMS
    // ===========================
		// const staff = zooqueue.getStaff()[zooqueue.companyIdAsKey()];
		// const filteredStaff = staff.filter( (item) => item.service_ids)
		// const staffBusy = [];
		// const staffFree = [];
		// const staffAway = [];
		// for (let staffMember of staff) {
		// 	// =============================================================================
		// 	// NOTE: STAFF MEMBER MUST SUPPORT AT LEAST ONE SERVICE IN THE CURRENT QUEUE
		// 	// =============================================================================
		// 	if (zooqueue.staffMemberHasServices(staffMember) && !staffMember.queuing_disabled) {
		// 		staffMember.attendance_status == 0? staffAway.push(staffMember) : staffMember.attendance_status == 1? staffFree.push(staffMember) : staffBusy.push(staffMember);
		// 		// staffMember.attendance_started && staffMember.attendance_status != 1? staffBusy.push(staffMember) : staffFree.push(staffMember);
		// 	}
		// }
		// staffBusy.sort( (a, b) => {
		// 	// console.log(a.appointmentTimeLeft, b.appointmentTimeLeft);
		// 	return a.appointmentTimeLeft - b.appointmentTimeLeft;
		// 	//return luxon.DateTime.fromISO(b.attendance_started) - luxon.DateTime.fromISO(a.attendance_started);
		// });
		// const shuffledStaff = staffFree.concat(staffBusy).concat(staffAway);
		// for (const staffMember of shuffledStaff) {
		// 	if ((!filters.staffMember || filters.staffMember.id == staffMember.id) && (!filters.customer || staffMember.service_ids.indexOf(filters.customer.services[0].id) != -1)) {
		// 		addStaffCardToDOM(staffMember);
		// 	}
		// }

    // ===============================
    // QUEUE CARDS: BUILD ITEMS
    // ===============================
		// let currentQueue = zooqueue.getCurrentQueue();
		// for (let customer of currentQueue.customers) {
		// 	if ((!filters.staffMember || filters.staffMember.service_ids.indexOf(customer.services[0].id) != -1) && (!filters.customer || filters.customer.id == customer.id)) {
		// 		addQueueCardToDOM(customer);
		// 	}
		// }
	}

	setQueueTitleInDOM();
	setEventListenersForDynamicContent();
	setSuperContainerPositionAndSize();
	setLoaded();

	zooqueue.consoleLog("buildDom: completed");
}
