const finishServingCtrl__EVENT = (el) => {
  const staffMemberId = el.getAttribute("staff-id");
  const staffMember = zooq.getStaffMember(staffMemberId);
  zooqApi().customerServeComplete(staffMember).then( (result) => {
    // do nothing
  }, err => {
    zooq.consoleError(err);
  });
};
