// dependencies...
const pusherService = require("../pusher/pusher.service.js");
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
						// push message to client...
						const data = {
							queue: {
								customer: payloadCustomerId								
							}
						}
						const type = "QUEUE__CUSTOMER_DELETE";
						pusherService().trigger(data, type);
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
