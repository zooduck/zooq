// methods...
const customersDeleteOne = (function customersDeleteOne () {
	const $run = (payload) => {
    // ====================================================================================
    // DELETE customer
    // OBJECTIVE: find the customer in the specified queue and delete them from the queue
    // ====================================================================================
    const companyIdAsKey = `_${payload.params.companyId}`;
    const payloadQueueId = payload.params.queueId;
    const payloadCustomerId = payload.id;

		return new Promise( (resolve, reject) => {
			payload.dbo.collection("q").update(
				{id: payloadQueueId},
				{$pull: {customers: {id: payloadCustomerId}}},
				(err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					console.log(`DELETE CUSTOMER result.nModified => ${result.nModified}`);
					payload.dbo.collection("q").find({}).toArray( (err, result) =>  {
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
						const data = {
							queue: {
								customer: {
									left: payloadCustomerId
								}
							}
						}
						pusher.trigger("queue-channel", "queue-event", {
							"data": data,
							"type": "QUEUE__CUSTOMER_DELETE",
						});
						// // push message to client...
						// pusher.trigger("queue-channel", "queue-event", {
						// 	"message": "q.db.json: changed",
						// 	"type": "q.db.json"
						// });
						const queues = {}
						queues[companyIdAsKey] = result;
						return resolve(JSON.stringify(queues));
					});
				}
			)
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
module.exports = customersDeleteOne;
