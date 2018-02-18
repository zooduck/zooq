const startShiftCtrl__EVENT = (el) => {
  const staffMemberId = el.getAttribute("staff-id");
  zooqApi().staffMemberStartShift(staffMemberId);
};
