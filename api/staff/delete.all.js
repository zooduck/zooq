// dependencies...
const fs = require("fs");
// methods...
const staffDeleteAll = (function staffDeleteAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const db = "./db/staff.db.json";

		return new Promise( (resolve, reject) => {
      fs.writeFile(db, "", "utf8", (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(JSON.stringify({info: "staff.db.json: DELETED"}));
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
module.exports = staffDeleteAll;
