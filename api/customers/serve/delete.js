// dependencies...
const fs = require("fs");
// methods...
const customersDeleteOne = (function customersDeleteOne () {
	const $run = (payload) => {
    // ==========================================================================================
    // DELETE customer from staff member (serving) and queue (customersBeingServed array)
    // OBJECTIVE: remove the customer from the staff member and update the staff member's status
		// OBJECTIVE: remove the customer from the customersBeingServed array in the current queue
		// OBJECTIVE: send info about the appointment to bookingbug
    // ==========================================================================================
		const companyIdAsKey = `_${payload.params.companyId}`;
		const payloadStaffMemberId = payload.id;
		const payloadQueueId = payload.params.queueId;
    const db = "./db/q.db.json";
    const staffDb = "./db/staff.db.json";

		let staff = [];
		let customer = {}

		// remove the customer from the staff member
		return new Promise( (resolve, reject) => {
				// read db (staff)...
				fs.readFile(staffDb, "utf8", (err, data) => {
					if (err) {
						console.log(err);
						reject(JSON.stringify({error: err}));
					}
					if (data && data != "") {
						staff = JSON.parse(data);
						staffMember = staff[companyIdAsKey].find( (item) => {
							return item.id == payloadStaffMemberId;
						});
						if (staffMember) {
							let customer = staffMember.serving[0];
							staffMember.serving = [];
							// ===========================
							// ATTENDANCE_STATUS LEGEND
							// ===========================
							// 0: AWOL (AWAY)
							// 1: AVAILABLE
							// 2: ON BREAK
							// 3: BUSY (OTHER)
							// 4: BUSY (IN APPOINTMENT)
							// ===========================
							staffMember.attendance_status = 1;
							staffMember.activeBooking = null;
							staffMember.activeBookingType = null;

							// write db (staff)...
							fs.writeFile(staffDb, JSON.stringify(staff), "utf8", (err) => {
								if (err) {
									console.log(err);
									reject(JSON.stringify({error: err}));
								}
								fs.readFile(db, "utf8", (err, data) => {
									if (err) {
										console.log(err);
										reject(err);
									}
									if (data && data != "") {
										let queues = JSON.parse(data);
										let currentQueue = queues[companyIdAsKey].find( (queue) => {
											return queue.id == payloadQueueId;
										});
										if (currentQueue && customer) {
											let customerIndex = currentQueue.customersBeingServed.findIndex( (item) => {
												return item.id == customer.id;
											});
											// remove customer from customersBeingServed array
											if (customer) {
													currentQueue.customersBeingServed.splice(customerIndex, 1);
											}
											fs.writeFile(db, JSON.stringify(queues), "utf8", (err) => {
												if (err) {
													console.log(err);
												}
												resolve(JSON.stringify({queues: queues, staff: staff}));
											});
										} else resolve(JSON.stringify({queues: queues, staff: staff}));
									} else reject(err);
								});
							});
						} else reject(err);
					} else resolve(JSON.stringify({error: `DELETE to api/customers/serve/${payloadStaffMemberId}/ failed logic test`}));
				})
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
module.exports = customersDeleteOne;
