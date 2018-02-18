const finishServingCtrl__EVENT = (el) => {

  let staffMemberId = el.getAttribute("staff-id");
  let staffMember = zooq.getStaffMember(staffMemberId);
  let booking = staffMember.activeBooking;
  let apiPromises = [zooqApi().customerServeComplete(staffMember)];

  if (booking) {
    apiPromises.unshift(bookingbugCancelBooking_POST(booking));
    // =============================================================================
    // TODO: CANCEL BOOKING IS FOR TESTING ONLY (so we can book again immediately)
    // =============================================================================
    Promise.all(apiPromises)
    .then ( (results) => {
      zooq.consoleLog(results);
      // zooqDOM().updateStaffCard(staffMember);
      // zooq.elements("superContainer").scrollTo(0, 0);
    }, err => {
      zooq.consoleError(err);
    });
  }
};
