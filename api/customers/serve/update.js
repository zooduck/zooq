// dependencies...
const fs = require("fs");
const luxon = require("luxon");
// methods...
const customersServeOne = (function customersServeOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
    const payloadCustomerId = payload.id;
    const payloadQueueId = payload.params.queueId;
		const payloadStaffMember = JSON.parse(payload.data);
    const db = "./db/q.db.json";
    const staffDb = "./db/staff.db.json";

    let queues = {}

    return new Promise((resolve, reject) => {
			// =====================
			// UPDATE CUSTOMER
			// =====================
      fs.readFile(db, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        if (data && data != "") {
          queues = JSON.parse(data);
        }

				// -------------------------
				// payload error checking
				// -------------------------
        let queueExists = false;
        let customerValid = false;
        let staffMemberInvalid = false;

        // does queue exist?
        if (queues[companyIdAsKey]) {
          queue = queues[companyIdAsKey].find( (item) => {
            return item.id == payloadQueueId;
          });
          if (queue) {
            queueExists = true;
          }
        }

        // is this customer in the queue?
        const customer = queue.customers.find( (customer) => customer.id == payloadCustomerId);
        customerValid = customer;

        // is this staff member already serving a customer?
        for (let customerBeingServed of queue.customersBeingServed) {
          staffMemberInvalid = customerBeingServed.servedBy.find( (item) => {
            return item.id == payloadStaffMember.id;
          });
        }

        if (queueExists && customerValid && !staffMemberInvalid) {

					delete queue.priorityCustomer;

          customer.status = "BEING_SEEN";
          customer.servedBy.push({ id: payloadStaffMember.id, name: payloadStaffMember.name });

          customer.waitTime = new Date().getTime() - customer.queueJoinTimeUnix;

          // delete the customer from the queue...
          for (i in queue.customers) {
            if (queue.customers[i].id == customer.id) {
              queue.customers.splice(i, 1);
              break;
            }
          }
          // add the customer to the queue object's customersBeingServed array...
          queue.customersBeingServed.push(customer);
          // write db (queues)...
          fs.writeFile(db, JSON.stringify(queues), "utf8", (err) => {
            if (err) {
              console.log(err);
              reject(err);
            }
						// =====================
						// UPDATE STAFF MEMBER
						// =====================
            fs.readFile(staffDb, "utf8", (err, data) => {
              if (err) {
                console.log(err);
                reject(err);
              }
              if (data != "") {
                let staff = JSON.parse(data);
                let staffMemberToUpdate = staff[companyIdAsKey].find( (item) => {
                  return item.id == payloadStaffMember.id;
                });
                if (staffMemberToUpdate) {
									// ===========================
									// ATTENDANCE_STATUS LEGEND
									// ===========================
									// 0: AWOL (AWAY)
									// 1: AVAILABLE
									// 2: ON BREAK
									// 3: BUSY (OTHER)
									// 4: BUSY (IN APPOINTMENT)
									// ===========================
									staffMemberToUpdate.attendance_status = 4;
									staffMemberToUpdate.activeBookingType = "QUEUE";
									staffMemberToUpdate.activeQueue = customer.queue;
									console.log(">>>>>>>>>>> SETTING staffMember.activeQueue to:", customer.queue);
									staffMemberToUpdate.activeBooking = payloadStaffMember.activeBooking;
									staffMemberToUpdate.activeBreak = null;
									staffMemberToUpdate.serving = [];

									// =====================================================================
									// this is mainly so we can get the ticketRef - as all other details
									// are included in the booking (activeBooking)
									//======================================================================
									console.log("PUSHING CUSTOMER TO STAFFMEMBER", customer);
                  staffMemberToUpdate.serving.push({
                    id: customer.id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    ticketRef: customer.ticketRef,
                    service: customer.services[0],
										queue: customer.queue
                  });

                  // write db (staff)...
                  fs.writeFile(staffDb, JSON.stringify(staff), "utf8", (err) => {
                    if (err) {
                      console.log(err);
                      reject(JSON.stringify({error:err}));
                    }
                    let responseData = {
                      queues: queues,
                      staff: staff
                    }
                    resolve(JSON.stringify(responseData)); // all queues and all staff for all child companies
                  });
                } else reject(JSON.stringify({error: "STAFF_MEMBER_NOT_FOUND"}));
              } else reject(JSON.stringify({error: "STAFF_DATABASE_EMPTY"}));
            });
          });
        } else {
					// console.log("queueExists:", queueExists, "customerValid:", customerValid, "!staffMemberInvalid:", !staffMemberInvalid);
					reject(JSON.stringify({error: `PUT to api/customers/serve/${payloadStaffMember.id}/ failed logic test`}));
				}
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
module.exports = customersServeOne;
