const unsetPriorityCustomerCtrl__EVENT = () => {
  setLoading();
  zooqueueApi().queueSetPriorityCustomer().then( (result) => {
    zooqueue.consoleLog(result);
    // setLoaded();
    // buildDom();  // user pusher instead
  }, err => {
    zooqueue.consoleError(err);
    setLoaded();
  });
};
