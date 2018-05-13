const endShiftCtrl__EVENT = (el) => {
  const staffMemberId = el.getAttribute("staff-id");
  zooqApi().staffMemberEndShift(staffMemberId).then( (staffMember) => {
    // do nothing...
  }, err => {
    zooq.consoleError(err);
  });
}
