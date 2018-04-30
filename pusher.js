const Pusher = require('pusher');
const pusher = new Pusher({
  // appId: "451830",
  // key: "991a027aa0c940510776",
  // secret: "e1e453012d89603adc67",
  appId: process.env.PUSHER_APP_ID,
  key: "991a027aa0c940510776",
  secret: process.env.PUSHER_APP_SECRET,
  cluster: "eu",
  encrypted: true
});
pusher.trigger("queue-channel", "queue-event", {
  "message": "hallo domper"
});
