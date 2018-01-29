// ==============================
// METHOD: buildServiceCheckbox
// ==============================
const buildServiceCheckbox = (service) => {
	const template__el = zooqueue.elements("queueCreateForm__serviceCheckboxItems").querySelector("[template]").cloneNode(true);
	template__el.removeAttribute("template");
	const uniqueId = zooqueue.generateUniqueId();
	const label__el = template__el.children[0];
	const input__el = template__el.children[1];
	label__el.innerHTML = `${service.name} (${service.durations[0]}m)`;
	label__el.setAttribute("for", uniqueId);
	input__el.value = service.id;
	input__el.id = uniqueId;

	zooqueue.elements("queueCreateForm__serviceCheckboxItems").appendChild(template__el);
};
