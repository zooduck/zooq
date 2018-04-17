const navBarCtrl__customerCreate__EVENT = (el) => {
  navBarHide({exceptions:["customerCreateForm", "navBarCtrl__customerCreate"]});
  el.classList.toggle("--active");
  zooq.elements("customerCreateForm").classList.toggle("--active");
  clearForm(zooq.elements("customerCreateForm").querySelector("form"));
};
