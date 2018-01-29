const startShiftCtrl__EVENT = (el) => {
  const staffMemberId = el.getAttribute("staff-id");
  zooqueueApi().staffMemberStartShift(staffMemberId);
};
