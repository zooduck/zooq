// dependencies...
const fs = require("fs");
const luxon = require("luxon");
// methods...
const staffUpdateOne = (function staffUpdateOne() {
  const $run = (payload) => {
    const companyIdAsKey = `_${payload.params.companyId}`;
    const breakMinutes = payload.params.breakMinutes;
    const payloadStaffId = payload.id;
    const staffDb = "./db/staff.db.json";

    return new Promise( (resolve, reject) => {
      // ================================
      // PUT STAFF MEMBER PUT ON BREAK
      // ================================
      fs.readFile(staffDb, "utf8", (err, data) => {
          if (err) {
            console.log(err);
            reject(JSON.stringify({error: err}));
          }
          if (data && data != "") {
            let staffCollections = JSON.parse(data);
            let staff = staffCollections[companyIdAsKey];
            let staffMember = staff.find( (item) => item.id == payloadStaffId);
            // ===========================
            // ATTENDANCE_STATUS LEGEND
            // ===========================
            // 0: AWOL (AWAY)
            // 1: AVAILABLE
            // 2: ON BREAK
            // 3: BUSY (OTHER)
            // 4: BUSY (IN APPOINTMENT)
            // ===========================
            staffMember.attendance_status = 2;
            staffMember.activeBooking = null;
            staffMember.activeBookingType = null;
            staffMember.activeBreak = {
              datetime: luxon.DateTime.local().toISO(),
              endDatetime: luxon.DateTime.local().plus({minutes: 15}),
              duration: 15
            }
            staffMember.activeBusy = null;
            fs.writeFile(staffDb, JSON.stringify(staffCollections), "utf8", (err) => {
              if (err) {
                console.log(err);
                reject(JSON.stringify({error: err}));
              }
              resolve(JSON.stringify(staffCollections)); // all staff for all companies
            });
          } else reject(JSON.stringify({error: "NO_DATA"}));
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
module.exports = staffUpdateOne;
