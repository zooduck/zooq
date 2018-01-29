function buildQueueCards(filters) {
  // ===============================
  // QUEUE CARDS: BUILD ITEMS
  // ===============================
  let currentQueue = zooqueue.getCurrentQueue();
  for (let customer of currentQueue.customers) {
    if ((!filters.staffMember || filters.staffMember.service_ids.indexOf(customer.services[0].id) != -1) && (!filters.customer || filters.customer.id == customer.id)) {
      addQueueCardToDOM(customer);
    }
  }
  zooqueue.consoleLog("buildQueueCards: completed");
}
