const customerCreateForm__submitCtrl__EVENT = () => {
  if (!zooqueue.hasQueues()) {
    zooqueue.alert("QUEUE_NOT_FOUND");
    return zooqueue.consoleError("QUEUE_NOT_FOUND");
  }
  const formData = new FormData(zooqueue.elements("customerCreateForm").querySelector("form"));
  const data = zooqueueApi().convertCustomerFormDataToJson(formData);

  if (data.error) {
    return zooqueue.consoleError(data.error);
  }

  zooqueueApi().customerCreate(data).then( (result) => {
    clearForm(zooqueue.elements("customerCreateForm").querySelector("form"));
    zooqueue.consoleLog(result);
    zooqueue.removeFilters(["customer"]);
    // buildDom(); // use pusher instead
  }, err => {
    zooqueue.consoleError(err);
  });
}
