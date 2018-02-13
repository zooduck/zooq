const finishServingCtrl__EVENT = (el) => {

  let staffMemberId = el.getAttribute("staff-id");
  let staffMember = zooqueue.getStaffMember(staffMemberId);
  let booking = staffMember.activeBooking;
  let apiPromises = [zooqueueApi().customerServeComplete(staffMember)];

  if (booking) {
    apiPromises.unshift(bookingbugCancelBooking_POST(booking));
    // =============================================================================
    // TODO: CANCEL BOOKING IS FOR TESTING ONLY (so we can book again immediately)
    // =============================================================================
    Promise.all(apiPromises)
    .then ( (results) => {
      zooqueue.consoleLog(results);
      // zooqDOM().updateStaffCard(staffMember);
      // zooqueue.elements("superContainer").scrollTo(0, 0);
    }, err => {
      zooqueue.consoleError(err);
    });
  }
};
