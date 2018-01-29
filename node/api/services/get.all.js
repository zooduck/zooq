// dependencies...
const fs = require("fs");
// methods...
const servicesGetAll = (function servicesGetAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const db = "./db/services.db.json";

		return new Promise( (resolve, reject) => {
			fs.readFile(db, "utf8", (err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				if (data == "") {
					let dbObj = {};
					dbObj[companyIdAsKey] = [];
					resolve(JSON.stringify(dbObj));
					console.log(`DATABASE ${db} IS EMPTY`);
				} else resolve(data); // all services for all child companies
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
module.exports = servicesGetAll;
