// dependencies...
const _ = require("lodash");
const pusherService = require("../../pusher/pusher.service.js");
// methods...
const staffUpdateAll = (function staffUpdateAll () {

  const $run = (payload) => {
    const companyIdAsKey = `_${payload.params.companyId}`;
    const payloadStaff = JSON.parse(payload.data);

    let oldStaff = {}
    payload.dbo.collection("staff").find({}).toArray( (err, result) => {
      if (err) {
        console.log(err);
        return reject(err);
      } else oldStaff[companyIdAsKey] = result;
    });

    return new Promise( (resolve, reject) => {
      payload.dbo.collection("staff").find({}).toArray( (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        payload.dbo.collection("staff").deleteMany({}, (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          payload.dbo.collection("staff").insertMany(payloadStaff, (err, result) => {
            if (err) {
              console.log(err);
              return reject(err);
            }
            const staff = {}
            staff[companyIdAsKey] = payloadStaff;
            if (!_.isEqual(staff, oldStaff)) {
              // push message to client...
              const data = {}
              const type = "STAFF__UPDATE_ALL";
              pusherService().trigger(data, type);
            }
            resolve(JSON.stringify(staff));
          });
        });
      })
    }); // end Promise
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
