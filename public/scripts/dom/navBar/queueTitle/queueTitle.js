const setQueueTitleInDOM = () => {
	if (zooq.hasQueues()) {
		// zooq.elements("navBarInfoQueueName").querySelector("span").innerHTML = `${zooq.getCurrentQueue().name} (${zooq.getCurrentQueue().customers.length})`;
		zooq.elements("navBarInfoQueueName").innerHTML = `${zooq.getCurrentQueue().name} (${zooq.getCurrentQueue().code})`;
		zooq.elements("navBarInfoQueueCount").innerHTML = `${zooq.getCurrentQueue().customers.length}`;
		const services = zooq.getCurrentQueue().serviceIds.map( (serviceId) => {
			return zooq.getService(serviceId);
		});
		zooq.elements("navBarInfoServices").innerHTML = services.map( (item) => {
			return `${item.name} (${item.code})`;
		}).join(" | ");
	} else {
		zooq.elements("navBarInfoQueueName").innerHTML = "NO_QUEUES_ERR";
		zooq.elements("navBarInfoQueueCount").innerHTML = "";
		zooq.elements("navBarInfoServices").innerHTML = "";
	}
	zooq.elements("navBarInfoDatetime").innerHTML = luxon.DateTime.local().toLocaleString(luxon.DateTime.DATETIME_MED);
};
