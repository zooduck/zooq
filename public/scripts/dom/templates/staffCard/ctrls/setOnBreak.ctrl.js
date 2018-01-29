const setOnBreakCtrl__EVENT = (el) => {
  // ==============================================
  // set this staff member on break for 15 minutes
  // TODO: minutes can be selected by user
  // ==============================================
  const staffMemberId = el.getAttribute("staff-id");
  setLoading();
  zooqueueApi().staffMemberSetOnBreak(staffMemberId).then( (staffMember) => {
    zooqueue.consoleLog("setOnBreak:", staffMember.name);
    // setLoaded();
  }, err => {
    zooqueue.consoleError(err);
  });
};
