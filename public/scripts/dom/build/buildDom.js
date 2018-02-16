function buildDom (filters = {}) {

	filters = zooq.getFilters();

	resetDom();

	if (zooq.hasServices()) {
		buildQueueCreateFormServiceCheckboxes();
	}

	if (zooq.hasQueues()) {
		// ======================================
		// CUSTOMER WAIT TIME ESTIMATES: RECALC
		// ======================================
		zooq.setEstimatedWaitTimes();

		buildCustomerCreateFormServiceSelectOptions();

		buildQueueList();

		buildStaffCards(filters);
		buildQueueCards(filters);

	}

	setQueueTitleInDOM();
	setSuperContainerPositionAndSize();
	setLoaded();

	zooq.consoleLog("buildDom: completed");
}
