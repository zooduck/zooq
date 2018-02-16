const queueListItemCtrl__EVENT = (el, form) => {
  const index = Array.from(form.children).indexOf(el) - 1;
  const ctrls = Array.from(form.children);
  for (let ctrl of ctrls) {
    ctrl.classList.remove("--active");
  }
  el.classList.add("--active");
  zooq.setCurrentQueueIndex(index);
  zooqDOM().setQueueTitle();

  zooq.setEstimatedWaitTimes();

  buildStaffCards({});
  buildQueueCards({});

  buildCustomerCreateFormServiceSelectOptions();

  navBarHide();
};
