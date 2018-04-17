const unsetPriorityCustomerCtrl__EVENT = () => {
  setLoading();
  zooqApi().queueSetPriorityCustomer().then( (result) => {
    zooq.consoleLog(result);
    // setLoaded();
    // buildDom();  // user pusher instead
  }, err => {
    zooq.consoleError(err);
    setLoaded();
  });
};
