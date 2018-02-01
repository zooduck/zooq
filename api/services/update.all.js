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

		// ====================================================
		// TEST UPDATE SERVICES COLLECTION IN MONGODB (MLAB)
		// ====================================================
		payload.dbo.collection("services").insertMany(payloadServices, (err, result) => {
			if (err) return console.log(err);
			console.log(`inserted ${result.insertedCount} docs into services`);
		});

		// ====================================================================================================================
		// TODO: add services that are not there (but exist in payload), delete services which are there (but not in payload)
		// ====================================================================================================================
		payload.dbo.collection("services").find({}).toArray( (err, dbServices) => {
			if (err) return console.log(err);
			for (const service of dbServices) { // loop all docs...
				// payload service exists in database?
				const serviceExistsInDatabase = payloadServices.find( (item) => item.id == service.id);
				if (!serviceExistsInDatabase) {
					// TODO: add the service to the database
				}
				// database service exists in payload?
				const serviceExistsInPayload = payload.dbo.collection("services").find(service).limit(1);
				if (!serviceExistsInPayload) {
					// TODO: delete the service from database
				}
			}
		});

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
