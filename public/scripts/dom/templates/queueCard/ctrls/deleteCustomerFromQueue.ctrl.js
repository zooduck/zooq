const deleteCustomerFromQueueCtrl__EVENT = (el) => {
  const id = el.getAttribute("customer-id");
  let customerIsPriorityCustomer = false;
  if (zooqueue.hasPriorityCustomer()) {
    customerIsPriorityCustomer = (zooqueue.getCustomer(id).id == zooqueue.getCurrentQueue().priorityCustomer.id);
  }
  if (customerIsPriorityCustomer) {
    return zooqueue.consoleError("PRIORITY_CUSTOMER_CANNOT_BE_DELETED");
  }

  setLoading();
  zooqueueApi().customerDelete(el.getAttribute("customer-id")).then( (result) => {
    zooqueue.consoleLog(result);
    setLoaded();
    // buildDom();  // user pusher instead
  }, err => {
    zooqueue.consoleError(err);
    setLoaded();
  });
};
