const unsetPriorityCustomerCtrl__EVENT = () => {
  setLoading();
  zooqueueApi().queueSetPriorityCustomer().then( (result) => {
    zooq.consoleLog(result);
    // setLoaded();
    // buildDom();  // user pusher instead
  }, err => {
    zooq.consoleError(err);
    setLoaded();
  });
};
