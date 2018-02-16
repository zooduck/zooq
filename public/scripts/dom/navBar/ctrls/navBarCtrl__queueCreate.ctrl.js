const navBarCtrl__queueCreate__EVENT = (el) => {
  navBarHide({exceptions:["queueCreateForm", "navBarCtrl__queueCreate"]});
  el.classList.toggle("--active");
  zooq.elements("queueCreateForm").classList.toggle("--active");
  clearForm(zooq.elements("queueCreateForm").querySelector("form"));
};
