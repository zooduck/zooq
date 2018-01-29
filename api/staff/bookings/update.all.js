// dependencies...
const fs = require("fs");
// methods...
const staffUpdateAll = (function staffUpdateAll () {

  const $run = (payload) => {  
    const companyIdAsKey = `_${payload.params.companyId}`;
    const payloadStaff = JSON.parse(payload.data);
    const staffDb = "./db/staff.db.json";

    return new Promise( (resolve, reject) => {
      fs.readFile(staffDb, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          reject(JSON.stringify({error: err}));
        }
        if (data && data != "") {
          const staffCollections = JSON.parse(data);
          staffCollections[companyIdAsKey] = payloadStaff;
          fs.writeFile(staffDb, JSON.stringify(staffCollections), "utf8", (err) => {
            if (err) {
              console.log(err);
              reject(JSON.stringify({error: err}));
            }
            resolve(JSON.stringify(staffCollections));
          });
        } else reject(JSON.stringify({error: "PUT to api/staff/bookings/ failed"}));
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
module.exports = staffUpdateAll;
