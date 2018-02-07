// dependencies...
const fs = require("fs");
const luxon = require("luxon");
const $http = require("http");
const _ = require("lodash");
// methods...
const staffUpdateAll = (function staffUpdateAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;

		// remove staff with queuing_disabled or who don't support any services...
		let payloadStaff = JSON.parse(payload.data).filter( (staffMember) => !staffMember.queuing_disabled && staffMember.service_ids.length > 0);

		let oldStaff = {}
		payload.dbo.collection("staff").find({}).toArray( (err, result) => {
			if (err) {
				console.log(err);
				return reject(err);
			} else oldStaff[companyIdAsKey] = result;
		});

		return new Promise( (resolve, reject) => {
			// ===================
			// 1. INSERT if new
			// 2. UPDATE if old
			// 3. DELETE if gone
			// ===================
			for (let staffMember of payloadStaff) {
				payload.dbo.collection("staff").findOne({id: staffMember.id}, (err, dbStaffMember) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					if (dbStaffMember) {
						// ===========
						// UPDATE...
						// ===========
						const newVals = {
							name: staffMember.name,
							service_ids: staffMember.service_ids
						}
						payload.dbo.collection("staff").updateOne({id: staffMember.id}, {$set: newVals}, (err, result) => {
							if (err) {
								console.log(err);
								return reject(err);
							}
						});
					} else {
						// ==========
						// INSERT...
						// ==========

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
						payload.dbo.collection("staff").insertOne(staffMember, (err, result) => {
							if (err) {
								console.log(err);
								return reject(err);
							}
						});
					}
				});
			}
			payload.dbo.collection("staff").find({}).toArray( (err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				for (let dbStaffMember of result) {
					if (!payloadStaff.find( (item) => item.id == dbStaffMember.id)) {
						// ===========
						// DELETE...
						// ===========
						payload.dbo.collection("staff").deleteOne({id: staffMember.id}, (err, result) => {
							if (err) {
								console.log(err);
								return reject(err);
							}
						});
					}
				}
			});
			payload.dbo.collection("staff").find({}).toArray( (err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				const staff = {}
				staff[companyIdAsKey] = result;
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

		}); // return new Promise( (resolve, reject) => {
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
