// dependencies...
const fs = require("fs");
const luxon = require("luxon");
const $http = require("http");
// methods...
const staffUpdateAll = (function staffUpdateAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const db = "./db/staff.db.json";
		let staffCollections = {};
		let currentStaff = [];
		let staffToKeep = []; // current staff with status of "busy"
		let staffToAdd = [];

		// remove staff with queuing_disabled or who don't support any services...
		let payloadStaff = JSON.parse(payload.data).filter( (staffMember) => !staffMember.queuing_disabled && staffMember.service_ids.length > 0);

		return new Promise((resolve, reject) => {
			// read db (staff)...
			fs.readFile(db, "utf8", (err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				if (data == "") {
					// ============================================================
					// STAFF DATABASE IS EMPTY AND MUST BE INITITALISED FOR USE
					// ============================================================
					for (let staffMember of payloadStaff) {
						// DELETE _embedded (we don't need this!)
						delete staffMember._embedded;
						for (i in staffMember._links) {
							if (i != "queuer") {
								// ============================================================================================================
								// DELETE all links except "queuer" - we might need that to get details of any current bookings in progress
								// although if that booking started earlier than the current day, then it will not be returned in the
								// bookings api call and in that case we can probably just ignore the one in _links anyway
								// EXCEPT... there might be scenarios where a booking actually does carry over from one day to the next =D
								// ============================================================================================================
								delete staffMember._links[i];
							}
						}
						// ===========================
						// ATTENDANCE_STATUS LEGEND
						// ===========================
						// 0: AWOL (AWAY)
						// 1: AVAILABLE
						// 2: ON BREAK
						// 3: BUSY (OTHER)
						// 4: BUSY (IN APPOINTMENT)
						// ===========================
						staffMember.activeBookingType = null;
						if (staffMember.attendance_status == 4) {
							staffMember.activeBookingType = "CALENDAR";
						}
						if (!staffMember.attendance_status) {
							staffMember.attendance_status = 0;
						}
						const nowDate = luxon.DateTime.local();
						const attendanceStarted = luxon.DateTime.fromISO(staffMember.attendance_started);
						const interval = luxon.Interval.fromDateTimes(attendanceStarted, nowDate);
						const hoursDiff = interval.toDuration("hours").toObject().hours;
						// ==================================================================================================
						// IF THE STAFF ATTENDANCE_STARTED IS MORE THAN 24 HOURS AGO, WE CAN ASSUME THAT SOMEBODY FORGOT
						// TO HIT THE FINISH SERVING BUTTON OR SOMETHING AND WE CAN RESET THEIR STATUS TO 0 (AWOL)
						// ==================================================================================================
						if (hoursDiff > 24) {
							staffMember.attendance_status = 0;
						}
					}
					// staff database is empty, init with data from bookingbug...
					staffCollections[companyIdAsKey] = payloadStaff;
				}

				if (data != "") {
					// ===================================================================================
					// STAFF DATABASE ALREADY EXISTS, UPDATE BY:
					// 1. ADDING NEW STAFF
					// 2. UPDATING SPECIFIC PROPS OF STAFF THAT MIGHT HAVE CHANGED SINCE QUEUE BEGAN
					//    - NOTE: AVOID PROPS SET BY THIS APPLICATION!
					// 3. DELETING STAFF THAT NO LONGER EXIST BECAUSE A. THEY NOW HAVE QUEUING DISABLED
					//    OR B. THEY WERE FIRED - NOTE: DO NOT DELETE STAFF WITH ATTENDANCE_STATUS OF 4!
					// ====================================================================================
					staffCollections = JSON.parse(data);
					currentStaff = staffCollections[companyIdAsKey];
					// ======================================
					// ADD NEW STAFF, UPDATE EXISTING STAFF
					// ======================================
					for (let staffMember of payloadStaff) {
						let existingStaffMember = currentStaff.find( (item) => item.id == staffMember.id);
						// update if existing, or add if new
						if (existingStaffMember) {
							existingStaffMember.name = staffMember.name; // maybe their name changed
							existingStaffMember.service_ids = staffMember.service_ids; // maybe the list of services they support changed
						} else currentStaff.push(staffMember);
					}
					// ====================================
					// DELETE STAFF THAT NO LONGER EXIST
					// ====================================
					currentStaff = currentStaff.filter( (staffMember) => payloadStaff.find( (item) => item.id == staffMember.id));
					// currentStaff.filter( (staffMember) => {
					// 	return staffMember.attendance_status == 4 || payloadStaff.find( (item) => item.id == staffMember.id);
					// });
					staffCollections[companyIdAsKey] = currentStaff;
				}
				// write db (staff)...
				console.log("STAFF COLLECTIONS FROM BOOKINGBUG", staffCollections);
				fs.writeFile(db, JSON.stringify(staffCollections), "utf8", (err) => {
					if (err) {
						console.log(err);
						reject(err);
					}
					resolve(JSON.stringify(staffCollections)); // all staff for all child companies
				});
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
