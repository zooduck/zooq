const setPriorityCustomerCtrl__EVENT = (el) => {
  setLoading();
  const customerId = el.getAttribute("customer-id");
  zooqueueApi().queueSetPriorityCustomer(customerId).then( (result) => {
    zooqueue.consoleLog(result);
    // setLoaded();
    // buildDom();  // user pusher instead
  }, err => {
    zooqueue.consoleError(err);
    setLoaded();
  });
};
