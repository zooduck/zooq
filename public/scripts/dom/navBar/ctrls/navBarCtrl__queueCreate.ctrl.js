const navBarCtrl__queueCreate__EVENT = (el) => {
  navBarHide({exceptions:["queueCreateForm", "navBarCtrl__queueCreate"]});
  el.classList.toggle("--active");
  zooqueue.elements("queueCreateForm").classList.toggle("--active");
  clearForm(zooqueue.elements("queueCreateForm").querySelector("form"));
};
