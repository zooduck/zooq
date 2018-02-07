// dependencies...
const _ = require("lodash");
// methods...
const queuesCreateOne = (function queuesCreateOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
    let payloadQueue = JSON.parse(payload.data);
    let oldQueues = {}
    payload.dbo.collection("q").find({}).toArray( (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      oldQueues[companyIdAsKey] = result;
    });
    return new Promise( (resolve, reject) => {
      payload.dbo.collection("q").insertOne(payloadQueue, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        payload.dbo.collection("q").find({}).toArray( (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          const queues = {}
          queues[companyIdAsKey] = result;
          if (!_.isEqual(queues, oldQueues)) {
            const Pusher = require('pusher');
            const pusher = new Pusher({
              appId: "451830",
              key: "991a027aa0c940510776",
              secret: "e1e453012d89603adc67",
              cluster: "eu",
              encrypted: true
            });
            // push message to client...
            pusher.trigger("queue-channel", "queue-event", {
              "message": "q.db.json: changed",
              "type": "q.db.json"
            });
          }
          return resolve(JSON.stringify(queues));
        });
      })
    }); // end Promise
	}
	return function () {
		return {
			run: (payload = { data: {}, params: [], id: "" }) => {
				return $run(payload);
			}
		}
	}
})();
// exports...
module.exports = queuesCreateOne;
