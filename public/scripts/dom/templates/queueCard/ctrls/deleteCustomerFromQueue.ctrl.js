const deleteCustomerFromQueueCtrl__EVENT = (el) => {
  const id = el.getAttribute("customer-id");
  let customerIsPriorityCustomer = false;
  if (zooq.hasPriorityCustomer()) {
    customerIsPriorityCustomer = (zooq.getCustomer(id).id == zooq.getCurrentQueue().priorityCustomer.id);
  }
  if (customerIsPriorityCustomer) {
    zooq.alert("PRIORITY_CUSTOMER_CANNOT_BE_DELETED");
    return zooq.consoleError("PRIORITY_CUSTOMER_CANNOT_BE_DELETED");
  }

  setLoading();

  zooqueueApi().customerDelete(el.getAttribute("customer-id")).then( (result) => {
    zooq.consoleLog(result);
    // setLoaded();
    // buildDom();  // user pusher instead
  }, err => {
    zooq.consoleError(err);
    setLoaded();
  });
};
