const navBarCtrl__customerCreate__EVENT = (el) => {
  navBarHide({exceptions:["customerCreateForm", "navBarCtrl__customerCreate"]});
  el.classList.toggle("--active");
  zooqueue.elements("customerCreateForm").classList.toggle("--active");
  clearForm(zooqueue.elements("customerCreateForm").querySelector("form"));
};
