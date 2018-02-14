function buildDom (filters = {}) {

	filters = zooqueue.getFilters();

	resetDom();

	if (zooqueue.hasServices()) {
		buildQueueCreateFormServiceCheckboxes();
	}

	if (zooqueue.hasQueues()) {
		// ======================================
		// CUSTOMER WAIT TIME ESTIMATES: RECALC
		// ======================================
		zooqueue.setEstimatedWaitTimes();

		buildCustomerCreateFormServiceSelectOptions();

		buildQueueList();

		buildStaffCards(filters);
		buildQueueCards(filters);

	}

	setQueueTitleInDOM();
	setSuperContainerPositionAndSize();
	setLoaded();

	zooqueue.consoleLog("buildDom: completed");
}
