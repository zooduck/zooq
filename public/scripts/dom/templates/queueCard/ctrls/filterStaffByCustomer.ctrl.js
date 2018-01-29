const filterStaffByCustomerCtrl__EVENT = (el) => {
  const filters = zooqueue.getFilters();
  const customer = zooqueue.getCustomer(el.parentNode.id);
  if (!filters.customer) {
    zooqueue.setFilter({customer: customer});
    zooqueue.elements("staffCustomerFilterInfo").innerHTML = `STAFF FILTER ACTIVE: ONLY DISPLAY STAFF WHO CAN SERVE ${customer.firstName} ${customer.lastName}`;
    zooqueue.elements("staffCustomerFilterInfo").parentNode.classList.add("--active");
  } else {
    zooqueue.removeFilters(["customer"]);
    zooqueue.elements("staffCustomerFilterInfo").parentNode.classList.remove("--active");
  }
  buildDom();
  window.scrollTo(0, 0);
};
