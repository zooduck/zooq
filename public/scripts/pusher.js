// Pusher.logToConsole = true;
const pusher = new Pusher("991a027aa0c940510776", {
  cluster: "eu",
  encrypted: true
});
const channel = pusher.subscribe("queue-channel");
channel.bind("queue-event", function(data) {
  zooq.pusherLog(data);

  if (zooq.isReady()) {

    // ==================
    // UPDATE ALL STAFF
    // ==================
    if (data.type == "STAFF__UPDATE_ALL") {
      zooqApi().staffGet().then( () => { // gets (from database) and sets (locally)
        const staff = zooq.getStaff()[zooq.companyIdAsKey()];
        for (const staffMember of staff) {
          zooqDOM().updateStaffCard(staffMember);
        }
      }, err => {
        zooq.consoleError(err);
      });
    }
    // =======================
    // UPDATE ALL SERVICES
    // =======================
    if (data.type == "SERVICES__UPDATE_ALL") {
      zooqApi().servicesGet().then( () => {
        buildDom();
      }, err => {
        zooq.consoleError(err);
      });
    }
    // =======================================
    // UPDATE STAFF MEMBER ATTENDANCE STATUS
    // =======================================
    if (data.type.match(/STAFF_MEMBER__ATTENDANCE/)) {
      zooqApi().staffGet().then( () => { // gets (from database) and sets (locally)
        const staffMember = zooq.getStaffMember(data.data.staffMember);
        console.log("THE STAFF MEMBER WHOSE STATUS HAS CHANGED IS", staffMember.name);
        zooqDOM().updateStaffCard(staffMember);
        // ---------------------------------------------------------------------
        // staff attendance_status has changed, so we need to re-calculate
        // estimated wait times and update customer cards in the current queue
        // ---------------------------------------------------------------------
        zooq.setEstimatedWaitTimes();
        for (const customer of zooq.getCurrentQueue().customers) {
          zooqDOM().updateQueueCard(customer);
        }
        zooq.elements("superContainer").scrollTo(0, 0);
        setLoaded();
      }, err => {
        zooq.consoleError(err);
        setLoaded();
      });
    }

    // ========================
    // ADD CUSTOMER TO QUEUE
    // ========================
    if (data.type == "QUEUE__CUSTOMER_ADD") {
      if (zooq.getCurrentQueue().id == data.data.queue.id) {
        zooqApi().queuesGet().then( () => {
          const customerId = data.data.queue.customer;
          zooq.setEstimatedWaitTimes();
          zooqDOM().addCustomerToQueue(customerId);
          zooqDOM().buildQueueList();
          zooqDOM().setQueueTitle();
          setLoaded();
        }, err => {
          zooq.consoleError(err);
          setLoaded();
        });
      } else {
        setQueueTitleInDOM();
        setLoaded();
      }
    }
    // ====================
    // CREATE NEW QUEUE
    // ====================
    if (data.type == "QUEUE__CREATE") {
      zooqApi().queuesGet().then( () => {
        buildDom();
      }, err => {
        zooq.consoleError(err);
        setLoaded();
      });
    }
    // =============================
    // DELETE CUSTOMER FROM QUEUE
    // =============================
    if (data.type == "QUEUE__CUSTOMER_DELETE") {
      const customerId = data.data.queue.customer;
      zooqDOM().deleteCustomerFromQueue(customerId);
      zooqApi().queuesGet().then( () => {
        zooqDOM().buildQueueList();
        zooqDOM().setQueueTitle();
        setLoaded();
      }, err => {
        zooq.consoleError(err);
        setLoaded();
      });
    }
    // =================================
    // SET PRIORITY CUSTOMER IN QUEUE
    // -------------------------------------------------
    // NOTE: This covers both set and unset methods
    // -------------------------------------------------
    // =================================
    if (data.type == "QUEUE__PRIORITY_CUSTOMER_SET") {
      const customerId = data.data.queue.priorityCustomer;
      zooqApi().queuesGet().then( () => {
        buildDom();
      }, err => {
        zooq.consoleError(err);
        setLoaded();
      });
    }
    // ============================
    // CUSTOMER SERVED FROM QUEUE
    // ============================
    if (data.type == "CUSTOMER__SERVE" || data.type == "CUSTOMER__FINISH_SERVING") {
      const promises = [zooqApi().queuesGet(), zooqApi().staffGet()];
      Promise.all(promises).then( () => {
        const staffMember = zooq.getStaffMember(data.data.staffMember);
        const customerId = data.data.customer;
        console.log(`THE STAFF MEMBER WHOSE STATUS WAS CHANGED TO ${staffMember.attendance_status} IS`, staffMember.name);
        zooqDOM().updateStaffCard(staffMember);
        if (data.type == "CUSTOMER__SERVE") {
          zooqDOM().deleteCustomerFromQueue(customerId);
        }
        zooq.elements("superContainer").scrollTo(0, 0);
        setLoaded();
        // buildDom();
      }, err => {
        zooq.consoleError(err);
        setLoaded();
      });
    }
  }
});
