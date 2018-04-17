const filterStaffByCustomerCtrl__EVENT = (el) => {
  const filters = zooq.getFilters();
  const customer = zooq.getCustomer(el.parentNode.id);
  if (!filters.customer) {
    zooq.setFilter({customer: customer});
    zooq.elements("staffCustomerFilterInfo").innerHTML = `STAFF FILTER ACTIVE: ONLY DISPLAY STAFF WHO CAN SERVE ${customer.firstName} ${customer.lastName}`;
    zooq.elements("staffCustomerFilterInfo").parentNode.classList.add("--active");
  } else {
    zooq.removeFilters(["customer"]);
    zooq.elements("staffCustomerFilterInfo").parentNode.classList.remove("--active");
  }
  buildDom();
  zooq.elements("superContainer").scrollTo(0, 0);
};
