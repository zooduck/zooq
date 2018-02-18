const customerCreateForm__submitCtrl__EVENT = () => {
  if (!zooq.hasQueues()) {
    return zooq.alert("QUEUE_NOT_FOUND");
  }
  const formData = new FormData(zooq.elements("customerCreateForm").querySelector("form"));
  const data = zooqApi().convertCustomerFormDataToJson(formData);

  if (data.error) {
    return zooq.consoleError(data.error);
  }

  setLoading();

  zooqApi().customerCreate(data).then( (result) => {
    clearForm(zooq.elements("customerCreateForm").querySelector("form"));
    zooq.removeFilters(["customer"]);
    navBarHide();  
  }, err => {
    zooq.consoleError(err);
  });
}
