const queueListItemCtrl__EVENT = (el, form) => {
  const index = Array.from(form.children).indexOf(el) - 1;
  const ctrls = Array.from(form.children);
  for (let ctrl of ctrls) {
    ctrl.classList.remove("--active");
  }
  el.classList.add("--active");
  zooqueue.setCurrentQueueIndex(index);
  zooqDOM().setQueueTitle();

  zooqueue.setEstimatedWaitTimes();

  buildStaffCards({});
  buildQueueCards({});

  buildCustomerCreateFormServiceSelectOptions();

  navBarHide();
};
