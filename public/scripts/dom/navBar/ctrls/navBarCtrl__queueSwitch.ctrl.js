const navBarCtrl__queueSwitch__EVENT = (el) => {
  navBarHide({exceptions:["queueSwitchForm", "navBarCtrl__queueSwitch"]});
  el.classList.toggle("--active");
  zooq.elements("queueSwitchForm").classList.toggle("--active");
};
