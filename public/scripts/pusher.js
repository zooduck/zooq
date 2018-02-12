// Pusher.logToConsole = true;
const pusher = new Pusher("991a027aa0c940510776", {
  cluster: "eu",
  encrypted: true
});
const channel = pusher.subscribe("queue-channel");
channel.bind("queue-event", function(data) {
  zooqueue.pusherLog(data);

  if (zooqueue.isReady()) {

    // ==================
    // UPDATE ALL STAFF
    // ==================
    if (data.type == "STAFF__UPDATE_ALL") {
      zooqueueApi().staffGet().then( () => { // gets (from database) and sets (locally)
        const staff = zooqueue.getStaff()[zooqueue.companyIdAsKey()];
        for (const staffMember of staff) {
          zooqDOM().updateStaffCard(staffMember);
        }
      }, err => {
        zooqueue.consoleError(err);
      });
    }
    // =======================
    // UPDATE ALL SERVICES
    // =======================
    if (data.type == "SERVICES__UPDATE_ALL") {
      zooqueueApi().servicesGet().then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
      });
    }
    // =======================================
    // UPDATE STAFF MEMBER ATTENDANCE STATUS
    // =======================================
    if (data.type.match(/STAFF_MEMBER__ATTENDANCE/)) {
      zooqueueApi().staffGet().then( () => { // gets (from database) and sets (locally)
        const staffMember = zooqueue.getStaffMember(data.data.staffMember);
        console.log("THE STAFF MEMBER WHOSE STATUS WAS CHANGED IS", staffMember.name);
        zooqDOM().updateStaffCard(staffMember);
        zooqueue.elements("superContainer").scrollTo(0, 0);
        setLoaded();
      }, err => {
        zooqueue.consoleError(err);
        setLoaded();
      });
    }

    // ========================
    // ADD CUSTOMER TO QUEUE
    // ========================
    if (data.type == "QUEUE__CUSTOMER_ADD") {
      if (zooqueue.getCurrentQueue().id == data.data.queue.id) {
        zooqueueApi().queuesGet().then( () => {
          const customerId = data.data.queue.customer;
          zooqueue.setEstimatedWaitTimes();
          zooqDOM().addCustomerToQueue(customerId);
          setQueueTitleInDOM();
          setLoaded();
        }, err => {
          zooqueue.consoleError(err);
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
      zooqueueApi().queuesGet().then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
        setLoaded();
      });
    }
    // =============================
    // DELETE CUSTOMER FROM QUEUE
    // =============================
    if (data.type == "QUEUE__CUSTOMER_DELETE") {
      const customerId = data.data.queue.customer;
      zooqDOM().deleteCustomerFromQueue(customerId);
      zooqueueApi().queuesGet().then( () => {
        setQueueTitleInDOM();
        setLoaded();
      }, err => {
        zooqueue.consoleError(err);
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
      zooqueueApi().queuesGet().then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
        setLoaded();
      });
    }
    // ============================
    // CUSTOMER SERVED FROM QUEUE
    // ============================
    if (data.type == "CUSTOMER__SERVE" || data.type == "CUSTOMER__FINISH_SERVING") {
      const promises = [zooqueueApi().queuesGet(), zooqueueApi().staffGet()];
      Promise.all(promises).then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
        setLoaded();
      });
    }
  }
});
