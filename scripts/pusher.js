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
      buildDom();
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
