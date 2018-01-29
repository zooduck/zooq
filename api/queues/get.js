// dependencies...
const fs = require("fs");
// methods...
const queuesGetOne = (function queuesGetOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const queueId = payload.id;
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
					const queues = JSON.parse(data)[companyIdAsKey];
					const requestedQueue = queues.find( (item) => {
						return item.id == queueId;
					});
					resolve(JSON.stringify(requestedQueue));
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
module.exports = queuesGetOne;
