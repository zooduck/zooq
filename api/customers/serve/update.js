// dependencies...
const luxon = require("luxon");
const pusherService = require("../../pusher/pusher.service.js");
// methods...
const customersServeOne = (function customersServeOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
    const payloadCustomerId = parseInt(payload.id);
    const payloadQueueId = parseInt(payload.params.queueId);
		const payloadStaffMember = JSON.parse(payload.data).staffMember;
		const payloadCustomer = JSON.parse(payload.data).customer;

    return new Promise( (resolve, reject) => {

			payloadCustomer.status = "BEING_SEEN";
			payloadCustomer.servedBy.push({ id: payloadStaffMember.id, name: payloadStaffMember.name });

			payload.dbo.collection("q").updateOne(
				{ id: payloadQueueId },
				{
					$pull: { customers: { id: payloadCustomerId } },
					$addToSet: { customersBeingServed: payloadCustomer },
					$set: { priorityCustomer: null }
				},
				(err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					// update staff member
					payload.dbo.collection("staff").findOne({id: payloadStaffMember.id}, (err, result) => {
						if (err) {
							console.log(err);
							return reject(err);
						}
						const staffMember__updated = result;
						// ===========================
						// ATTENDANCE_STATUS LEGEND
						// ===========================
						// 0: AWOL (AWAY)
						// 1: AVAILABLE
						// 2: ON BREAK
						// 3: BUSY (OTHER)
						// 4: BUSY (IN APPOINTMENT)
						// ===========================
						staffMember__updated.attendance_status = 4;
						staffMember__updated.activeBookingType = "QUEUE";
						staffMember__updated.activeQueue = payloadCustomer.queue;
						staffMember__updated.activeBooking = payloadStaffMember.activeBooking;
						staffMember__updated.activeBreak = null;
						staffMember__updated.serving = [];
						// =====================================================================
						// this is mainly so we can get the ticketRef - as all other details
						// are included in the booking (activeBooking)
						//======================================================================
						staffMember__updated.serving.push({
							id: payloadCustomer.id,
							firstName: payloadCustomer.firstName,
							lastName: payloadCustomer.lastName,
							ticketRef: payloadCustomer.ticketRef,
							service: payloadCustomer.services[0],
							queue: payloadCustomer.queue
						});
						payload.dbo.collection("staff").replaceOne(
							{ id: staffMember__updated.id },
							staffMember__updated,
							(err, result) => {
								if (err) {
									console.log(err);
									return reject(err);
								}
								const data = {
									queue: {
										id: payloadQueueId,
										customers: {
											delete: payloadCustomer.id
										},
										customersBeingServed: {
											update: payloadCustomer.id
										},
									},
									staff: {
										update: staffMember__updated.id
									}
								}
								const type = "CUSTOMER__SERVE";
								pusherService().trigger(data, type);
								resolve(JSON.stringify(result));
							}
						);
					});
				}
			);
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
module.exports = customersServeOne;
