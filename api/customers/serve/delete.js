// dependencies...
const pusherService = require("../../pusher/pusher.service.js");
// methods...
const customersDeleteOne = (function customersDeleteOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const payloadStaffMemberId = parseInt(payload.id);
		const payloadQueueId = parseInt(payload.params.queueId);
		const payloadCustomerId = parseInt(payload.params.customerId);

		return new Promise( (resolve, reject) => {
			payload.dbo.collection("staff").updateOne(
				{ id: payloadStaffMemberId },
				{ $set:
					{
						serving: [],
						attendance_status: 1,
						activeBooking: null,
						activeBookingType: null
					}
				},
				(err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					payload.dbo.collection("q").updateOne(
						{ id: payloadQueueId },
						{ $pull: { customersBeingServed: { id: payloadCustomerId } } },
						(err, result) => {
							if (err) {
								console.log(err);
								return reject(err);
							}
							const data = {}
							const type = "CUSTOMER__FINISH_SERVING";
							pusherService().trigger(data, type);
							resolve(JSON.stringify({}));
						}
					);
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
module.exports = customersDeleteOne;
