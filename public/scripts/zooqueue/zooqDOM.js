const zooqDOM = (function zooqDOM() {
  return function () {
    return {
      addCustomerToQueue(id) {
        const customer = zooqueue.getCustomer(id);
        const options = { animate: true }
        addQueueCardToDOM(customer, options);
      },
      deleteCustomerFromQueue(id) {
        deleteQueueCardFromDOM(id);
      },
      updateQueueCard(customer) {
        updateQueueCardInDOM(customer);
      },
      updateStaffCard(staffMember) {
        updateStaffCardInDOM(staffMember)
      }
    }
  }
})();
