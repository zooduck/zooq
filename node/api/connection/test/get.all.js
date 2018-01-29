// dependencies...
const fs = require("fs");
// methods...
const connectionTest = (function connectionTest () {
	const $run = (payload) => {
    return new Promise( (resolve, reject) => {
      resolve("CONNECTION_SUCCESS");
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
module.exports = connectionTest;
