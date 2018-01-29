const serveNextCtrl__EVENT = (el, customer = null) => {
  // return alert("serve next ctrl todo! ioh");

  let staffMemberServing = zooqueue.getStaffMember(el.getAttribute("staff-id"));
  let customerToServe = customer || zooqueue.findNextCustomerToServe(staffMemberServing);

  if (!customerToServe) {
    zooqueue.alert("CUSTOMER_TO_SERVE_NOT_FOUND");
    // return zooqueue.consoleError("CUSTOMER_TO_SERVE_NOT_FOUND");
  }

  const serviceSupported = staffMemberServing.service_ids.find( (item) => item == customerToServe.services[0].id);
  if (!serviceSupported) {
    zooqueue.alert(null, `${staffMemberServing.name} is not qualified to serve ${customerToServe.firstName} ${customerToServe.lastName}`);
    return zooqueue.consoleError("SERVICE_NOT_SUPPORTED");
  }

  zooqueueApi().connectionTest().then( () => {
    // ============================
    // CREATE BOOKINGBUG BASKET
    // ============================
    const currentQueueId = zooqueue.getCurrentQueue().id;
    const service = customerToServe.services[0];
    const service_id = service.id;
    const company_id = service.company_id;
    const duration = service.durations[0];
    const person_id = staffMemberServing.id;
    const date = luxon.DateTime.local().toISODate();
    const time = ((luxon.DateTime.local().toObject().hour * 60) + (luxon.DateTime.local().toObject().minute));
    const first_name = customerToServe.firstName;
    const last_name = customerToServe.lastName;
    const email = customerToServe.email;
    const mobile = customerToServe.mobile;
    const questions = [];
    const default_company_id = company_id;
    const extra_info = { locale: "en" }

    const client = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      extra_info: extra_info,
      mobile: mobile,
      questions: questions,
      default_company_id: default_company_id
    };

    const item = {
      company_id: company_id,
      service_id: service_id,
      duration: duration,
      person_id: person_id,
      date: date,
      time: time
    };

    const bbBasketData = {
      client: client,
      item: item
    }

    const bookingbugApi__addClient__Promise = new Promise( (resolve, reject) => {
      bookingbugAddClient_POST(client).then((result) => {
        const clientData = JSON.parse(result);
        if (clientData.error) {
          zooqueue.consoleError(clientData.error);
          reject(clientData.error);
        }
        zooqueue.consoleLog(`POST to https://starfox.bookingbug.com/api/v1/admin/${default_company_id}/client:`, client);
        client.id = clientData.id;
        resolve(client);
      }, err => {
        zooqueue.consoleError(err);
        reject(err);
      })
    });

    // ==========================================================
    // BOOKINGBUG CLIENT CREATE (OR UPDATE IF ALREADY EXISTS)
    // ==========================================================
    bookingbugApi__addClient__Promise.then( (result) => {
      const bbBasket = zooqueue.buildBookingbugBasket(bbBasketData);
      // ==========================================
      // BOOKINGBUG ADD ITEM (CHECKOUT BASKET)
      // ==========================================
      const bookingbugApi__addItem__Promise = new Promise( (resolve, reject) => {
        bookingbugAddItem_POST(bbBasket).then( (result) => {
          let basket = JSON.parse(result);
          if (basket.error) {
            zooqueue.consoleError(basket.error);
            return reject(basket);
          }
          zooqueue.consoleLog(`POST to https://starfox.bookingbug.com/api/v1/${default_company_id}/basket/checkout:`, basket);
          resolve(basket);
        }, err => {
          zooqueue.consoleError("error", err);
          reject(err);
        });
      });
      bookingbugApi__addItem__Promise.then( (result) => {

        const booking = result._embedded.bookings[0];
        staffMemberServing.activeBooking = booking;

        const data = {
          customer: customerToServe,
          staffMember: staffMemberServing
        };

        // ==========================================
        // NOTE: DUAL RESPONSIBILITY ENDPOINT
        // serve customer and update staff member
        // ==========================================
        zooqueueApi().customerServe(JSON.stringify(data)).then((result) => {
          zooqueue.consoleLog(result);
          zooqueue.removeFilters(["customer"]);
          setLoaded();
          // buildDom(); // use pusher instead
        }, err => {
          zooqueue.removeFilters(["customer"]);
          zooqueue.consoleError(err);
        });
      }, err => {
        zooqueue.consoleError(err);
      });
    });
  }, err => {
    return zooqueue.consoleError(err);
  });
};
