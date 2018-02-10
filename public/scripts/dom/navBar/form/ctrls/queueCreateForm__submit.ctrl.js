const queueCreateForm__submitCtrl__EVENT = () => {
  const formData = new FormData(zooqueue.elements("queueCreateForm").querySelector("form"));
  const data = zooqueueApi().convertQueueFormDataToJson(formData);

  if (data.error) {
    return zooqueue.consoleError(data.error);
  }

  zooqueueApi().queueCreate(data).then( (result) => {
    clearForm(zooqueue.elements("queueCreateForm").querySelector("form"));
    const queueData = JSON.parse(data);
    zooqueue.alert(null, `The ${queueData.name} queue was successfully created.`);
    navBarHide();
    zooqueue.consoleLog(result);
  }, err => {
    zooqueue.consoleError(err);
  });
};
