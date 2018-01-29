const finishServingCtrl__EVENT = (el) => {

  let staffMemberId = el.getAttribute("staff-id");
  let staffMember = zooqueue.getStaffMember(staffMemberId);
  let booking = staffMember.activeBooking;
  let apiPromises = [zooqueueApi().customerServeComplete(staffMemberId)];

  if (booking) {
    apiPromises.unshift(bookingbugCancelBooking_POST(booking));
    // =============================================================================
    // NOTE: CANCEL BOOKING IS FOR TESTING ONLY (so we can book again immediately)
    // =============================================================================
    Promise.all(apiPromises)
    .then ( (results) => {
      zooqueue.consoleLog(results);
      // setLoaded(); pusher takes care of this
    }, err => {
      zooqueue.consoleError(err);
    });
  }
};
