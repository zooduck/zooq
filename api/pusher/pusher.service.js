// dependencies...
const Pusher = require("pusher");
// methods...
const pusherService = (function pusherService (data, type) {
  return function () {
    const pusher = new Pusher({
      appId: "451830",
      key: "991a027aa0c940510776",
      secret: "e1e453012d89603adc67",
      cluster: "eu",
      encrypted: true
    });
    return {
      trigger(data, type) {
        console.log("push notification of type", type);
        pusher.trigger("queue-channel", "queue-event", {
          "data": data,
          "type": type
        });
      }
    }
  }
})();
// exports...
module.exports = pusherService;
