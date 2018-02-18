const queueCreateForm__submitCtrl__EVENT = () => {
  const formData = new FormData(zooq.elements("queueCreateForm").querySelector("form"));
  const data = zooqApi().convertQueueFormDataToJson(formData);

  if (data.error) {
    return zooq.consoleError(data.error);
  }

  zooqApi().queueCreate(data).then( (result) => {
    clearForm(zooq.elements("queueCreateForm").querySelector("form"));
    const queueData = JSON.parse(data);
    zooq.alert(null, `The ${queueData.name} queue was successfully created.`);
    navBarHide();
    zooq.consoleLog(result);
  }, err => {
    zooq.consoleError(err);
  });
};
