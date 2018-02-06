// dependencies...
const fs = require("fs");
// methods...
const servicesGetAll = (function servicesGetAll () {
	const $run = (payload) => {
		return new Promise( (resolve, reject) => {
			const companyIdAsKey = `_${payload.params.companyId}`;
			let services = {}
			payload.dbo.collection("services").find({}).toArray( (err, dbServices) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				services[companyIdAsKey] = dbServices;
				return resolve(JSON.stringify(services));
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
