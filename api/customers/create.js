// dependencies...
const pusherService = require("../pusher/pusher.service.js");
// methods...
const customersCreateOne = (function customersCreateOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const payloadCompanyId = parseInt(payload.params.companyId);
	  const payloadQueueId = payload.params.queueId;
		const payloadCustomer = JSON.parse(payload.data);

		return new Promise( (resolve, reject) => {

			const customerValid = payloadCustomer.firstName && payloadCustomer.services && payloadCustomer.services.length > 0;
			if (!customerValid) {
				return resolve(JSON.stringify({error: `POST to api/customers/ failed logic test`}));
			}

			payload.dbo.collection("q").update(
				{ id: payloadQueueId },
				{ $addToSet: { customers: payloadCustomer } },
				(err, result) => {
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
								customer: payloadCustomer.id
							}
						}
						const type = "QUEUE__CUSTOMER_ADD";
						pusherService().trigger(data, type);
						const queues = {}
						queues[companyIdAsKey] = result;
						return resolve(JSON.stringify(queues));
					});
				});
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
module.exports = customersCreateOne;
