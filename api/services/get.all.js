// dependencies...
const fs = require("fs");
// methods...
const servicesGetAll = (function servicesGetAll () {
	const $run = (payload) => {
		return new Promise( (resolve, reject) => {
			const companyIdAsKey = `_${payload.params.companyId}`;
			payload.dbo.collection("services").find({}).toArray( (err, dbServices) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				const services = {}
				services[companyIdAsKey] = dbServices;
				// console.log("SERVICES CHANGED TO =>", services);
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
