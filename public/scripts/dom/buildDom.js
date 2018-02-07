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

	}

	setQueueTitleInDOM();
	setEventListenersForDynamicContent();
	setSuperContainerPositionAndSize();
	setLoaded();

	zooqueue.consoleLog("buildDom: completed");
}
