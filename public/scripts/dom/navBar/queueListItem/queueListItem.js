const addQueueListItemToDOM = (queue) => {
	const form = zooqueue.elements("queueSwitchForm");
	const template = form.querySelector("[template]").cloneNode(true);
	template.removeAttribute("template");
	if (zooqueue.getCurrentQueue().id == queue.id) {
		template.classList.add("--active");
	}
	const queueName__el = template.querySelector(".switch-queue__item__name");
	const queueCreatedAt__el = template.querySelector(".switch-queue__item__created-at");
	const createdAt = luxon.DateTime.fromISO(queue.createdAt).toLocaleString(luxon.DateTime.DATETIME_MED);
	// const span__el = template.querySelector("span")
	queueName__el.innerHTML = `${queue.name} (${queue.customers.length})`;
	queueCreatedAt__el.innerHTML = `created: ${createdAt}`;

	// ==================
	// EVENT LISTENER
	// ==================
	template.onclick = function (e) {
		queueListItemCtrl__EVENT(this, form);
	};

	form.appendChild(template);
};
