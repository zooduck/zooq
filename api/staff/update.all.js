// dependencies...
const fs = require("fs");
const luxon = require("luxon");
const _ = require("lodash");
const request = require("request");
const pusherService = require("../pusher/pusher.service.js");
// methods...
const staffUpdateAll = (function staffUpdateAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;

		// remove staff with queuing_disabled or who don't support any services...
		let payloadStaff = JSON.parse(payload.data).filter( (staffMember) => !staffMember.queuing_disabled && staffMember.service_ids.length > 0);

		const oldStaffPromise = new Promise( (resolve, reject) => {
			let oldStaff = {}
			payload.dbo.collection("staff").find({}).toArray( (err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				} else {
					oldStaff[companyIdAsKey] = result;
					return resolve(oldStaff);
				}
			});
		});
		return oldStaffPromise.then( (oldStaff) => {
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
								service_ids: staffMember.service_ids,
								avatarUrl: staffMember.avatarUrl
							}
							const changedVals = Object.keys(newVals).filter( (key) => {
								return !_.isEqual(newVals[key], dbStaffMember[key]);
							});
							if (changedVals.length > 0) {
								// console.log("UPDATING STAFF MEMBER:", staffMember.name, "WITH UPDATED KEYS OF:", changedVals);
								payload.dbo.collection("staff").updateOne({id: staffMember.id}, {$set: newVals}, (err, result) => {
									if (err) {
										console.log(err);
										return reject(err);
									}
								});
							}
						} else {
							// ==========
							// INSERT...
							// ==========
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
							// =====================================================================================================
							// NOTE: IF THE STAFF attendance_started IS MORE THAN 24 HOURS AGO, WE CAN ASSUME THAT SOMEBODY FORGOT
							// TO HIT THE FINISH SERVING BUTTON OR SOMETHING AND WE CAN RESET THEIR STATUS TO 0 (AWOL)
							// =====================================================================================================
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
							payload.dbo.collection("staff").deleteOne({id: dbStaffMember.id}, (err, result) => {
								if (err) {
									console.log(err);
									return reject(err);
								}
							});
						}
					}
					payload.dbo.collection("staff").find({}).toArray( (err, result) => {
						if (err) {
							console.log(err);
							return reject(err);
						}
						const staff = {}
						staff[companyIdAsKey] = result;
						if (!_.isEqual(oldStaff, staff)) {
							const data = {}
							const type = "STAFF__UPDATE_ALL";
							pusherService().trigger(data, type);
						}
						staff[companyIdAsKey].sort( (a, b) => a.id - b.id);
						resolve(JSON.stringify(staff));
					});
				});
			}); // end Promise
		}, err => {
			console.log(err);
		}); // end oldStaffPromise
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
