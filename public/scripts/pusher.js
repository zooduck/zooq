// Pusher.logToConsole = true;
const pusher = new Pusher("991a027aa0c940510776", {
  cluster: "eu",
  encrypted: true
});
const channel = pusher.subscribe("queue-channel");
let lastBuildDomRequestDate = luxon.DateTime.local();
channel.bind("queue-event", function(data) {
  zooqueue.pusherLog(data);

  if (zooqueue.isReady()) {
    // ==================
    // UPDATE ALL STAFF
    // ==================
    if (data.type == "STAFF__UPDATE_ALL") {
      zooqueueApi().staffGet().then( () => {
        buildDom();
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
    // ========================
    // ADD CUSTOMER TO QUEUE
    // ========================
    if (data.type == "QUEUE__CUSTOMER_ADD") {
      zooqueueApi().queuesGet().then( () => {
        const customerId = data.data.queue.customer.joined;
        zooqueue.setEstimatedWaitTimes();
        zooqDOM().addCustomerToQueue(customerId);
      }, err => {
        zooqueue.consoleError(err);
      });
    }
    // ====================
    // CREATE NEW QUEUE
    // ====================
    if (data.type == "QUEUE__CREATE") {
      zooqueueApi().queuesGet().then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
      });
    }
    // =============================
    // DELETE CUSTOMER FROM QUEUE
    // =============================
    if (data.type == "QUEUE__CUSTOMER_DELETE") {
      const customerId = data.data.queue.customer.left;
      zooqDOM().deleteCustomerFromQueue(customerId);
      zooqueueApi().queuesGet().then( () => {
        // do nothing...
      }, err => {
        zooqueue.consoleError(err);
      });
    }



    // =================================
    // get latest queues data...
    // NOTE: queuesGet() gets and sets
    // =================================
    if (data.type == "q.db.json") {
      zooqueueApi().queuesGet().then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
      });
    }
    // ===============================
    // get latest staff data...
    // NOTE staffGet() gets and sets
    // ===============================
    if (data.type == "staff.db.json") {
      zooqueueApi().staffGet().then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
      });
    }
    // ==============================
    // get latest services data...
    // ==============================
    if (data.type == "services.db.json") {
      zooqueueApi().servicesGet().then( () => {
        buildDom();
      }, err => {
        zooqueue.consoleError(err);
      });
    }
  }
});
// ===========
// buildDom
// ===========
setInterval( () => {
  if (zooqueue.isReady() && lastBuildDomRequestDate) {
    const nowDate = luxon.DateTime.local();
    const intervalSeconds = luxon.Interval.fromDateTimes(lastBuildDomRequestDate, nowDate).toDuration("seconds").toObject().seconds;
    if (intervalSeconds >= 0.5) {
      // console.log("INTERVAL GREATER THAN 0.5 SECONDs, BUILD DOM");
      lastBuildDomRequestDate = null;
      //buildDom();
    }
  }
}, 200);
