// dependencies...
const luxon = require("luxon");
// methods...
const staffUpdateOne = (function staffUpdateOne() {
  const $run = (payload) => {
    const companyIdAsKey = `_${payload.params.companyId}`;
    const actionType = payload.params.actionType;
    const payloadStaffMemberId = parseInt(payload.id);

    return new Promise( (resolve, reject) => {
      // ===========================
      // ATTENDANCE_STATUS LEGEND
      // ===========================
      // 0: AWOL (AWAY)
      // 1: AVAILABLE
      // 2: ON BREAK
      // 3: BUSY (OTHER)
      // 4: BUSY (IN APPOINTMENT)
      // ===========================
      const data = {
        attendance_status: 1,
        appointmentTimeLeft: 0,
        attendance_ended: null,
        activeBooking: null,
        activeBookingType: null,
        activeBreak: null,
        activeBusy: null
      }
      if (actionType == "START_SHIFT") {
        // ============================
        // init for start shift ONLY
        // ============================
        data.attendance_started = luxon.DateTime.local().toISO();
      }
      payload.dbo.collection("staff").update({id: payloadStaffMemberId}, {$set: data}, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        payload.dbo.collection("staff").find({id: payloadStaffMemberId}).toArray( (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
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
          return resolve(JSON.stringify(result));
        });
      });
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
module.exports = staffUpdateOne;
