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
		const services = zooqueue.getCurrentQueue().serviceIds.map( (serviceId) => {
			return zooqueue.getService(serviceId);
		});
		// for (let service of zooqueue.getCurrentQueue().services) {
		for (let service of services) {
			if (!service.queuing_disabled) {
				buildServiceOption(service);
			}
		}
    // // ======================================
    // // QUEUE LIST: BUILD QUEUE LIST LINKS
    // // ======================================
		// let queues = zooqueue.getQueues()[zooqueue.companyIdAsKey()];
		// for (let queue of queues) {
		// 	addQueueListItemToDOM(queue);
		// }



		buildQueueList();

		buildStaffCards(filters);
		buildQueueCards(filters);

	}

	setQueueTitleInDOM();
	setEventListenersForDynamicContent();
	setSuperContainerPositionAndSize();
	setLoaded();

	zooqueue.consoleLog("buildDom: completed");
}
