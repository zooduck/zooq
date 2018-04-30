const navBarCtrl__queueSwitch__EVENT = (el) => {
  if (!zooq.hasQueues() || zooq.getQueues()[zooq.companyIdAsKey()].length < 2) {
    return zooq.alert("SWITCH_QUEUE__QUEUE_NOT_FOUND");
  }
  navBarHide({exceptions:["queueSwitchForm", "navBarCtrl__queueSwitch"]});
  el.classList.toggle("--active");
  zooq.elements("queueSwitchForm").classList.toggle("--active");
};
