const zooqDOM = (function zooqDOM() {
  return function () {
    return {
      addCustomerToQueue(id) {
        const customer = zooqueue.getCustomer(id);
        addQueueCardToDOM(customer);
      },
      deleteCustomerFromQueue(id) {
        removeQueueCardFromDom(id);      
      }
    }
  }
})();
