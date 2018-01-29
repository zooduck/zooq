const filterCustomersByStaffMemberServicesCtrl__EVENT = (el) => {
  const filters = zooqueue.getFilters();
  const staffMember = zooqueue.getStaffMember(el.parentNode.parentNode.id);
  if (!filters.staffMember) {
    zooqueue.setFilter({staffMember: staffMember});
    zooqueue.elements("staffCustomerFilterInfo").parentNode.classList.add("--active");
    zooqueue.elements("staffCustomerFilterInfo").innerHTML = `CUSTOMER FILTER ACTIVE: ONLY DISPLAY CUSTOMERS THAT CAN BE SERVED BY ${staffMember.name}`;
  } else {
    zooqueue.removeFilters(["staffMember"]);
    zooqueue.elements("staffCustomerFilterInfo").parentNode.classList.remove("--active");
  }
  buildDom();
  window.scrollTo(0, 0);
};
