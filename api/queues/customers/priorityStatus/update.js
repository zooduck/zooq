// dependencies...
const fs = require("fs");
// methods...
const queuesUpdateOne = (function queuesUpdateOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const priorityCustomerId = payload.data.id;
		const payloadQueueId = payload.id;
    const payloadQueue = JSON.parse(payload.data);
		const db = "./db/q.db.json";

		return new Promise( (resolve, reject) => {
			fs.readFile(db, "utf8", (err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				if (data == "") {
					let dbObj = {};
					dbObj[companyIdAsKey] = [];
					resolve(dbObj);
				} else {
					const queues = JSON.parse(data);
					const queueToUpdateIndex = queues[companyIdAsKey].findIndex( (item) => item.id == payloadQueueId);
          queues[companyIdAsKey][queueToUpdateIndex] = payloadQueue;
          fs.writeFile(db, JSON.stringify(queues), "utf8", (err) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            resolve(JSON.stringify(queues));
          });
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
module.exports = queuesUpdateOne;
