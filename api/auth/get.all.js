// dependencies...
const fs = require("fs");
// methods...
const authGetAll = (function authGetAll () {
	const $run = (payload) => {
		console.log('payload', payload);
		return new Promise( (resolve, reject) => {
      resolve(JSON.stringify({
				authToken: payload.authToken,
				appId: payload.appId,
				appKey: payload.appKey
			}));
		});
	}
	return function () {
		return {
			run: (payload = { data: {}, params: [], id: "", dbo: {}, authToken: "", appId: "", appKey: "" }) => {
				return $run(payload);
			}
		}
	}
})();
// exports...
module.exports = authGetAll;