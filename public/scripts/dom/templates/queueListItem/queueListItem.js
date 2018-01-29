// ===============================
// METHOD: addQueueListItemToDOM
// ===============================
const addQueueListItemToDOM = (queue) => {
	const form = zooqueue.elements("queueSwitchForm");
	const template = form.querySelector("[template]").cloneNode(true);
	template.removeAttribute("template");
	if (zooqueue.getCurrentQueue().id == queue.id) {
		template.classList.add("--active");
	}
	const span__el = template.querySelector("span")
	span__el.innerHTML = `${queue.name} (${queue.customers.length})`;

	form.appendChild(template);
};
