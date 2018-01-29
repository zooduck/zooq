// dependencies...
const fs = require("fs");
// methods...
const queuesCreateOne = (function queuesCreateOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const db = "./db/q.db.json";
		let payloadQueue = JSON.parse(payload.data);
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
				if (!queues[companyIdAsKey]) {
					queues[companyIdAsKey] = [];
				}

				// -------------------------
				// payload error checking
				// -------------------------
				let queueInvalid = false;	
				if (payloadQueue.serviceIds.length < 1) {
					// queue is not assigned to any services!
					queueInvalid = true;
				} else {
					let pattern = new RegExp(`^${payloadQueue.name}$`, "i");
					// queue name already exists? (case-insensitive)
					queueInvalid = queues[companyIdAsKey].find( (item) => {
						return item.name.match(pattern);
					});		
				}
				if (!queueInvalid) {
					queues[companyIdAsKey].push(payloadQueue);
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
					resolve(JSON.stringify({error: "POST to api/queues/ failed logic test"}));
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
module.exports = queuesCreateOne;
