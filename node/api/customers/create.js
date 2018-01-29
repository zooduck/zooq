// dependencies...
const fs = require("fs");
// methods...
const customersCreateOne = (function customersCreateOne () {
	const $run = (payload) => {
	const companyIdAsKey = `_${payload.params.companyId}`;
    const payloadQueueId = payload.params.queueId;
	const payloadCustomer = JSON.parse(payload.data);
    const db = "./db/q.db.json";
    let queues = {}

		return new Promise((resolve, reject) => {
			// read db...
			fs.readFile(db, "utf8", (err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				if (data && data != "") {
					queues = JSON.parse(data);
				}

				// -------------------------
				// payload error checking
				// -------------------------
		        let queueExists = false;
		        let customerValid = false;

		        // does queue exist?
		        if (queues[companyIdAsKey]) {
		          queue = queues[companyIdAsKey].find( (item) => {
		            return item.id == payloadQueueId;
		          });
		          if (queue) {
		            queueExists = true;
		          }
		        }
		        // customer must have a serviceId, customer must have a firstName
		        if (payloadCustomer.firstName && payloadCustomer.firstName.trim() != "" && payloadCustomer.services && payloadCustomer.services[0] && payloadCustomer.services[0].id) {
		          customerValid = true;
		        }

		        if (queueExists && customerValid) {
		          // push the customer to the relevant queue...
		          queue.customers.push(payloadCustomer);
					// write db...
					fs.writeFile(db, JSON.stringify(queues), "utf8", (err) => {
						if (err) {
							console.log(err);
							reject(err);
						} else {
							resolve(JSON.stringify(queues)); // all queues for all child companies
						}
					});
				} else {
					resolve(JSON.stringify({error: `POST to api/customers/ failed logic test`}));
				}
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
module.exports = customersCreateOne;
