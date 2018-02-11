// dependencies...
const luxon = require("luxon");
const pusherService = require("../../../pusher/pusher.service.js");
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
        attendance_status: 3,
        activeBooking: null,
        activeBookingType: null,
        activeBreak: null,
        activeBusy: {
          datetime: luxon.DateTime.local().toISO(),
          endDatetime: luxon.DateTime.local().plus({minutes: 15}).toISO(),
          duration: 15
        }
      }
      payload.dbo.collection("staff").update({id: payloadStaffMemberId}, {$set: data}, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        payload.dbo.collection("staff").findOne({id: payloadStaffMemberId}, (err, result) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          // push message to client...
          const data = {
            staffMember: payloadStaffMemberId
          }
          const type = "STAFF_MEMBER__ATTENDANCE__3_BUSY";
          pusherService().trigger(data, type);
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
