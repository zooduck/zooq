const setPriorityCustomerCtrl__EVENT = (el) => {
  setLoading();
  const customerId = el.getAttribute("customer-id");
  zooqApi().queueSetPriorityCustomer(customerId).then( (result) => {
    zooq.consoleLog(result);
    // setLoaded();
    // buildDom();  // user pusher instead
  }, err => {
    zooq.consoleError(err);
    setLoaded();
  });
};
