// methods...
const queuesUpdateOne = (function queuesUpdateOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		// const priorityCustomerId = payload.data.id;
		const payloadCompanyId = parseInt(payload.params.companyId);
		const payloadQueueId = payload.id;
    const payloadQueue = JSON.parse(payload.data);

		const newData = {
			$set: {
				priorityCustomer: payloadQueue.priorityCustomer
			}
		}

		return new Promise( (resolve, reject) => {
			payload.dbo.collection("q").updateOne({id: payloadQueueId}, newData, (err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				console.log("QUEUE UPDATE modifiedCount =>", result.modifiedCount);
				payload.dbo.collection("q").find({companyId: payloadCompanyId}).toArray( (err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
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
					const queues = {}
					queues[companyIdAsKey] = result;
					return resolve(JSON.stringify(queues));
				});
			});
		});
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
module.exports = queuesUpdateOne;
