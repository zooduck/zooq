const customerCreateForm__submitCtrl__EVENT = () => {
  if (!zooqueue.hasQueues()) {
    return zooqueue.alert("QUEUE_NOT_FOUND");
  }
  const formData = new FormData(zooqueue.elements("customerCreateForm").querySelector("form"));
  const data = zooqueueApi().convertCustomerFormDataToJson(formData);

  if (data.error) {
    return zooqueue.consoleError(data.error);
  }

  setLoading();

  zooqueueApi().customerCreate(data).then( (result) => {
    clearForm(zooqueue.elements("customerCreateForm").querySelector("form"));
    zooqueue.removeFilters(["customer"]);
    navBarHide();  
  }, err => {
    zooqueue.consoleError(err);
  });
}
