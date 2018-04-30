const serveNextCtrl__EVENT = (el, customer = null) => {
  const staffMemberServing = zooq.getStaffMember(el.getAttribute("staff-id"));
  const customerToServe = customer || zooq.findNextCustomerToServe(staffMemberServing);

  if (!customerToServe) {
    return zooq.alert("CUSTOMER_TO_SERVE_NOT_FOUND");
  }

  const serviceSupported = staffMemberServing.service_ids.find( (item) => item == customerToServe.services[0].id);
  if (!serviceSupported) {
    zooq.alert(null, `${staffMemberServing.name} is not qualified to serve ${customerToServe.firstName} ${customerToServe.lastName}.`);
    return zooq.consoleError("SERVICE_NOT_SUPPORTED");
  }

  setLoading();

  zooqApi().connectionTest().then( () => {
    //setLoading();
    // ==========================================
    // NOTE: DUAL RESPONSIBILITY ENDPOINT
    // serve customer and update staff member
    // ==========================================
    const appointmentStartDate = new Date().toISOString();
    const appointmentDuration = customerToServe.services[0].durations[0];
    const fakeBooking = {
      datetime: appointmentStartDate,
      duration: appointmentDuration
    };
    staffMemberServing.activeBooking = fakeBooking;
    const data = {
      customer: customerToServe,
      staffMember: staffMemberServing
    };
    zooqApi().customerServe(JSON.stringify(data)).then((result) => {
      zooq.removeFilters(["customer"]);
      zooq.consoleLog(result);
    }, err => {
      zooq.removeFilters(["customer"]);
      zooq.consoleError(err);
    });
  }, err => {
    setLoaded();
  });
};
