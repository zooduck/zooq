const Pusher = require('pusher');
const pusher = new Pusher({
  appId: "451830",
  key: "991a027aa0c940510776",
  secret: "e1e453012d89603adc67",
  cluster: "eu",
  encrypted: true
});
pusher.trigger("queue-channel", "queue-event", {
  "message": "hallo domper"
});

// watch databases...
const fs = require("fs");
const time = new Date().getTime();
const lastWatchEvents = {
  "staff.db.json": time,
  "services.db.json": time,
  "q.db.json": time
};
let lastWatchEventTime = time;
fs.watch("./db/", {}, (eventType, filename) => {

    let time = new Date().getTime();
    let lastTime = lastWatchEvents[filename];
    let interval = time - lastTime;

    lastWatchEvents[filename] = time;

    if (interval > 250) { // NOTE: THIS PREVENTS DUPLICATE PUSH NOTIFICATIONS (because we get one for readFile and one for writeFile)
        // push message to client...
        pusher.trigger("queue-channel", "queue-event", {
          "message": `${filename}: ${eventType}`,
          "type": filename
        });
    }

    // server log...
		console.log(`${filename}: ${eventType}`);
});
// ==============================================================================================
// NOTE: using fs.watchFile instead of fs.watch solves the problem of duplicate push notifications
// HOWEVER, fs.watchFile is not reccommended by Node Docs as it is less efficient.
// We also need to set the polling interval as the default is quite high. At 250 milliseconds
// it is still nowhere near as efficient as fs.watch
// ==============================================================================================
// fs.watchFile("./db/staff.db.json", {persistent: true, interval: 250}, (current, previous) => {
//   pusher.trigger("queue-channel", "queue-event", {
//     "message": "staff.db.json changed"
//   });
// });
// fs.watchFile("./db/services.db.json", {persistent: true, interval: 250}, (current, previous) => {
//   pusher.trigger("queue-channel", "queue-event", {
//     "message": "services.db.json changed"
//   });
// });
// fs.watchFile("./db/q.db.json", {persistent: true, interval: 250}, (current, previous) => {
//   pusher.trigger("queue-channel", "queue-event", {
//     "message": "q.db.json changed"
//   });
// });
