// Pusher.logToConsole = true;
const pusher = new Pusher("991a027aa0c940510776", {
  cluster: "eu",
  encrypted: true
});
const channel = pusher.subscribe("queue-channel");
channel.bind("queue-event", function(data) {

  zooq.pusherLog(data);

  if (zooq.isReady() && data.type) {
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
        zooq.consoleLog(`${staffMember.name}'s status changed to: ${staffMember.attendance_status}`);
        if (staffMember.attendance_status === 0) {
          const shiftDuration = zooq.getShiftDuration(staffMember);
          zooq.consoleLog(`${staffMember.name}'s shift ended with a total duration of: ${shiftDuration}`);
        }
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
      zooqApi().queuesGet().then( () => {
        const customerId = data.data.queue.customer;
        zooq.setEstimatedWaitTimes();
        zooqDOM().buildQueueList();
        zooqDOM().setQueueTitle();
        if (zooq.getCurrentQueue().id == data.data.queue.id) {
          zooqDOM().addCustomerToQueue(customerId);
        }
        setLoaded();
      }, err => {
        zooq.consoleError(err);
        setLoaded();
      });
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
      if (zooq.getCurrentQueue().id == data.data.queue.id) {
        zooqDOM().deleteCustomerFromQueue(customerId);
      }
      zooqApi().queuesGet().then( () => {
        zooqDOM().buildQueueList();
        zooqDOM().setQueueTitle();
        zooq.setEstimatedWaitTimes();
        for (const customer of zooq.getCurrentQueue().customers) {
          zooqDOM().updateQueueCard(customer);
        }
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
        zooq.consoleLog(`${staffMember.name}'s STATUS CHANGED TO: ${staffMember.attendance_status}`);
        zooqDOM().updateStaffCard(staffMember);
        if (data.type == "CUSTOMER__SERVE") {
          zooqDOM().deleteCustomerFromQueue(customerId);
        }
        zooqDOM().buildQueueList();
        zooqDOM().setQueueTitle();
        zooq.setEstimatedWaitTimes();
        for (const customer of zooq.getCurrentQueue().customers) {
          zooqDOM().updateQueueCard(customer);
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
