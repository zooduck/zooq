// dependencies...
const _ = require("lodash");
const pusherService = require("../pusher/pusher.service.js");
// methods...
const servicesUpdateAll = (function servicesUpdateAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		let oldServices = {}
		payload.dbo.collection("services").find({}).toArray( (err, result) => {
			if (err) {
				console.log(err);
				return reject(err);
			} else oldServices[companyIdAsKey] = result;
		});
		return new Promise( (resolve, reject) => {
			let payloadServices = JSON.parse(payload.data);
			payloadServices = payloadServices.filter( (service) => !service.queuing_disabled);
			const serviceCodes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
			payloadServices.forEach( (item, index, arr) => {
				let code = serviceCodes.slice(index, index + 1) + serviceCodes.slice((index? index + 1 : 2) * -1, (index? index : 1) * -1);
				item.code = code;
			});
			// ===========================================================
			// INSERT services that are not there (but exist in payload)
			// DELETE services which are there (but not in payload)
			// ============================================================S
			payload.dbo.collection("services").find({}).toArray( (err, dbServices) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				for (const dbService of dbServices) { // loop all docs...
					// payload service exists in database?
					const serviceToUpdate = payloadServices.find( (item) => item.id == dbService.id);
					// DA
					if (serviceToUpdate) {
						// update service in database with latest data from bookingbug api (in payloadServices)
						// -------------------------------------------------------------------------------------------------------------
						// NOTE: this will not modify (overwrite) the document in the collection if it contains exactly the same data
						// -------------------------------------------------------------------------------------------------------------
						const q = { id: serviceToUpdate.id };
						payload.dbo.collection("services").updateOne(q, {$set: serviceToUpdate}, (err, result) => {
							if (err) {
								console.log(err);
								return reject(err);
							}
							console.log(`UPDATED => ${result.modifiedCount} docs in services`);
						});
					} else {
						// service no longer exists, delete it!
						payload.dbo.collection("services").deleteOne(dbService, (err, result) => {
							if (err) {
								console.log(err);
								return reject(err);
							}
							console.log(`DELETED => ${result.deletedCount} docs from services`);
						});
					}
				}
				for (const payloadService of payloadServices) {
					const serviceExists = dbServices.find( (item) => item.id == payloadService.id);
					if (!serviceExists) {
						// service is new, add it!
						payload.dbo.collection("services").insertOne(payloadService, (err, result) => {
							if (err) {
								console.log(err);
								return reject(err);
							}
							console.log(`INSERTED => ${result.insertedCount} docs into services`);
						});
					}
				}
				payload.dbo.collection("services").find({}).toArray( (err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					const services = {}
					services[companyIdAsKey] = result;
					if (!_.isEqual(services, oldServices)) {
						// push message to client...
						const data = {}
						const type = "SERVICES__UPDATE_ALL";
						pusherService().trigger(data, type);
					}
					return resolve(JSON.stringify(services));
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
