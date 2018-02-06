// dependencies...
const fs = require("fs");
// methods...
const staffGetAll = (function staffGetAll () {
	const $run = (payload) => {
		return new Promise( (resolve, reject) => {
			const companyIdAsKey = `_${payload.params.companyId}`;
			payload.dbo.collection("staff").find({}).toArray( (err, dbStaff)  => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				const staffCollections = {}
				staffCollections[companyIdAsKey] = dbStaff;
				return resolve(JSON.stringify(staffCollections));
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
module.exports = staffGetAll;
