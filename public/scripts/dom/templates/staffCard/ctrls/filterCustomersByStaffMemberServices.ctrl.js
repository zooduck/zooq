const filterCustomersByStaffMemberServicesCtrl__EVENT = (el) => {
  const filters = zooq.getFilters();
  const staffMember = zooq.getStaffMember(el.parentNode.parentNode.id);
  if (!filters.staffMember) {
    zooq.setFilter({staffMember: staffMember});
    zooq.elements("staffCustomerFilterInfo").parentNode.classList.add("--active");
    zooq.elements("staffCustomerFilterInfo").innerHTML = `CUSTOMER FILTER ACTIVE: ONLY DISPLAY CUSTOMERS THAT CAN BE SERVED BY ${staffMember.name}`;
  } else {
    zooq.removeFilters(["staffMember"]);
    zooq.elements("staffCustomerFilterInfo").parentNode.classList.remove("--active");
  }
  buildDom();
  zooq.elements("superContainer").scrollTo(0, 0);
};
