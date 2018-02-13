const setQueueTitleInDOM = () => {
	if (zooqueue.hasQueues()) {
		// zooqueue.elements("navBarInfoQueueName").querySelector("span").innerHTML = `${zooqueue.getCurrentQueue().name} (${zooqueue.getCurrentQueue().customers.length})`;
		zooqueue.elements("navBarInfoQueueName").innerHTML = `${zooqueue.getCurrentQueue().name} (${zooqueue.getCurrentQueue().code})`;
		zooqueue.elements("navBarInfoQueueCount").innerHTML = `${zooqueue.getCurrentQueue().customers.length}`;
		const services = zooqueue.getCurrentQueue().serviceIds.map( (serviceId) => {
			return zooqueue.getService(serviceId);
		});
		zooqueue.elements("navBarInfoServices").innerHTML = services.map( (item) => {
			return `${item.name} (${item.code})`;
		}).join(" | ");
	} else {
		zooqueue.elements("navBarInfoQueueName").innerHTML = "NO_QUEUES_ERR";
		zooqueue.elements("navBarInfoQueueCount").innerHTML = "";
		zooqueue.elements("navBarInfoServices").innerHTML = "";
	}
	zooqueue.elements("navBarInfoDatetime").innerHTML = luxon.DateTime.local().toLocaleString(luxon.DateTime.DATETIME_MED);
};
