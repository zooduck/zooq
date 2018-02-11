// dependencies...
const pusherService = require("../../../pusher/pusher.service.js");
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
				payload.dbo.collection("q").find({companyId: payloadCompanyId}).toArray( (err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					// push message to client...
					const data = {
						queue: {
							priorityCustomer: payloadQueue.priorityCustomer? payloadQueue.priorityCustomer.id : null
						}
					}
					const type = "QUEUE__PRIORITY_CUSTOMER_SET";
					pusherService().trigger(data, type);
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
