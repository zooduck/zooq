
// dependencies...
const fs = require("fs");
// methods...
const servicesUpdateAll = (function servicesUpdateAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const db = "./db/services.db.json";
		let payloadServices = JSON.parse(payload.data);
		let services = {};

		for (const service of payloadServices) {
			delete service._links;
		}
		payloadServices = payloadServices.filter( (service) => !service.queuing_disabled);

		return new Promise((resolve, reject) => {
			// read db...
			fs.readFile(db, "utf8", (err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				if (data && data != "") {
					services = JSON.parse(data);
				}
				let alphabet = new String("abcdefghijklmnopqrstuvwxyz").split("");
				for (service of payloadServices) {
					service.code = alphabet.shift().toUpperCase();
				}
				services[companyIdAsKey] = payloadServices;
				// write db...
				fs.writeFile(db, JSON.stringify(services), "utf8", (err) => {
					if (err) {
						console.log(err);
						reject(err);
					} else {
						resolve(JSON.stringify(services)); // all services for all child companies
					}
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
module.exports = servicesUpdateAll;
