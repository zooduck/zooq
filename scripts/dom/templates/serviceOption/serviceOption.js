// =============================
// METHOD: buildServiceOption
// =============================
const buildServiceOption = (service) => {
	const customerCreateForm__serviceSelect = zooqueue.elements("customerCreateForm__serviceSelect");
	const option = document.createElement("OPTION");
	// option.value = `${service.id}|${service.name}`;
	option.value = service.id;
	option.innerHTML = `${service.name} (${service.durations[0]}m)`;

	customerCreateForm__serviceSelect.appendChild(option);
};
