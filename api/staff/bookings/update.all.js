// dependencies...
const _ = require("lodash");
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
              const Pusher = require('pusher');
              const pusher = new Pusher({
                appId: "451830",
                key: "991a027aa0c940510776",
                secret: "e1e453012d89603adc67",
                cluster: "eu",
                encrypted: true
              });
              // push message to client...
              pusher.trigger("queue-channel", "queue-event", {
                "message": "staff.db.json: changed",
                "type": "staff.db.json"
              });
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
