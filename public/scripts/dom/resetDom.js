function resetDom () {
	// ========================================
	// CUSTOMER: CREATE FORM SERVICE OPTIONS
	// ========================================
	Array.from(zooqueue.elements("customerCreateForm__serviceSelect").children).forEach( (item, index, arr) => {
		// if (index > 0) {
			item.parentNode.removeChild(item);
		// }
	});
  // ========================================
  // QUEUE: CREATE FORM SERVICE CHECKBOXES
  // ========================================
	Array.from(zooqueue.elements("queueCreateForm__serviceCheckboxItems").children).forEach( (item, index, arr) => {
		if (index > 0) {
			item.parentNode.removeChild(item);
		}
	});
  // ==========================
  // QUEUE LIST: CLEAR ITEMS
  // ==========================
	Array.from(zooqueue.elements("queueSwitchForm").children).forEach( (item, index, arr) => {
		if (index > 0) {
			item.parentNode.removeChild(item);
		}
	});

	resetCards();

	zooqueue.consoleLog("resetDom: completed");
}
