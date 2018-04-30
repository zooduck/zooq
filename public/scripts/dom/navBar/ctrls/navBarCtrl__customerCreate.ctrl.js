const navBarCtrl__customerCreate__EVENT = (el) => {
  if (!zooq.hasQueues()) {
    return zooq.alert("ADD_CUSTOMER__QUEUE_NOT_FOUND");
  }
  navBarHide({exceptions:["customerCreateForm", "navBarCtrl__customerCreate"]});
  el.classList.toggle("--active");
  zooq.elements("customerCreateForm").classList.toggle("--active");
  clearForm(zooq.elements("customerCreateForm").querySelector("form"));
};
