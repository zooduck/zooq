function buildQueueCards(filters) {
  resetQueueCards();
  // ===============================
  // QUEUE CARDS: BUILD ITEMS
  // ===============================
  let currentQueue = zooq.getCurrentQueue();
  for (let customer of currentQueue.customers) {
    if ((!filters.staffMember || filters.staffMember.service_ids.indexOf(customer.services[0].id) != -1) && (!filters.customer || filters.customer.id == customer.id)) {
      addQueueCardToDOM(customer);
    }
  }
  zooq.consoleLog("buildQueueCards: completed");
}
