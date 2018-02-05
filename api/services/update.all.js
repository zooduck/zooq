// dependencies...
const fs = require("fs");
// methods...
const servicesUpdateAll = (function servicesUpdateAll () {
	const $run = (payload) => {
		return new Promise( (resolve, reject) => {
			const companyIdAsKey = `_${payload.params.companyId}`;
			const db = "./db/services.db.json";
			let payloadServices = JSON.parse(payload.data);
			let services = {};
			for (const service of payloadServices) {
				delete service._links;
			}
			payloadServices = payloadServices.filter( (service) => !service.queuing_disabled);
			// ====================================================================================================================
			// add services that are not there (but exist in payload), delete services which are there (but not in payload)
			// ====================================================================================================================
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
							console.log(err);
							return reject(err);
						});
						console.log(`INSERTED => ${result.insertedCount} docs into services`);
					}
				}
				payload.dbo.collection("services").find({}).toArray( (err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					services[companyIdAsKey] = result;	
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
