const zooqueueApi = (function zooqueueApi () {
	const $getLastTicketRef = (serviceCode = null) => {
		const customersInQueue = zooqueue.getCurrentQueue().customers;
		customersInQueue.reverse();
		if (serviceCode) {
			const pattern = new RegExp(`${serviceCode}$`);
			const customerWithSameService = customersInQueue.find( (item) => {
				return item.ticketRef.match(pattern);
			});
			if (customerWithSameService) {
				return parseInt(customerWithSameService.ticketRef);
			}
		}
		return 0;
	};
	const $generateTicketRef = (lastTicketRef, serviceId) => {
		let ticketRef = parseInt(lastTicketRef) + 1;
		let serviceCode = zooqueue.getService(serviceId).code;
		let queueCode = zooqueue.getCurrentQueue().code;
		switch (ticketRef.toString().length) {
			case 1: ticketRef = `00${ticketRef}`; break;
			case 2: ticketRef = `0${ticketRef}`; break;
		}
		return serviceCode? `${ticketRef}${queueCode}:${serviceCode}` : ticketRef;
	};
	const $convertQueueFormDataToJson = (formData) => {
		const data = {
			id: zooqueue.generateUniqueId(),
			companyId: zooqueue.companyId(),
			customers: [],
			customersBeingServed: [],
			serviceIds: [],
			services: []
		};
		for (let pair of formData) {
			let key = pair[0];
			let val = pair[1];
			if (key == "serviceId") {
				let serviceId = parseInt(val);
				data.serviceIds.push(serviceId);

				let service = zooqueue.getService(serviceId);
				data.services.push(service);

			} else data[key] = val;
		}

		// ==================
		// FORM VALIDATION
		// ==================
		if (data.name.trim() == "" || !data.serviceIds[0]) {
			zooqueue.alert("QUEUE_FORM_QUEUE_NAME_OR_SERVICE_INVALID");
			return {error: "$convertQueueFormDataToJson() failed"};
		}

		return JSON.stringify(data);
	};
	const $convertCustomerFormDataToJson = (formData) => {
		const queue = zooqueue.getCurrentQueue();
		const queueBasic = {
			id: queue.id,
			name: queue.name
		}
		const nowDate = luxon.DateTime.local();
		const data = {
			id: zooqueue.generateUniqueId(),
			status: "IN_QUEUE",
			queue: queueBasic,
			queueJoinTimeUnix: nowDate.valueOf(),
			queueStarted: nowDate,
			servedBy: [],
			services: []
		};
		for (let pair of formData) {
			let key = pair[0];
			let val = pair[1];
			if (key == "serviceId") {
				let serviceId = parseInt(val);
				let service = zooqueue.getService(serviceId);
				data.services.push(service);
			} else data[key] = val;
		}

		// ==================
		// FORM VALIDATION
		// ==================
		if (!data.services[0] || !data.firstName) {
			zooqueue.alert("CUSTOMER_FORM_FIRST_NAME_OR_SERVICE_INVALID");
			return {error: "$convertCustomerFormDataToJson() failed"};
		}

		const service = zooqueue.getService(data.services[0].id);
		const lastTicketRef = $getLastTicketRef(service.code);
		data.ticketRef = $generateTicketRef(lastTicketRef, service.id);
		const serviceCode = data.ticketRef.split("").pop();
		const ticketRefCode = data.ticketRef.match(/\D+/);
		const ticketRefNumber = data.ticketRef.match(/\d+/);
		data.ticketRefDisplay = `${ticketRefCode[0]}${ticketRefNumber[0]}`;
		// console.log("ticketRefCode", ticketRefCode);
		// data.ticketRefDisplay = `${serviceCode}${data.ticketRef.substr(0, data.ticketRef.length - 1)}`;

		return JSON.stringify(data);
	};
	const $connectionTest = () => {
		return $http("GET", `api/connection/test`);
	};
	const $queuesGet = () => {
		// ------------------------------------------
		// Get all queues for all child companies
		// -------------------------------------------
		return $http("GET", `api/queues/?companyId=${zooqueue.companyId()}`);
	};
	const $queueCreate = (data) => {
		// ------------------------------------------
		// Create a queue for the current company
		// -------------------------------------------
		const requestHeaders = [["Content-Type", "application/json"]];
		const id = encodeURIComponent(JSON.parse(data).id);
		return $http("POST", `api/queues/${id}/?companyId=${zooqueue.companyId()}`, data, requestHeaders);
	};
	const $queueSetPriorityCustomer = (data) => {
		// =====================================================================
		// NOTE: THIS CAN DELETE THE priorityCustomer PROP AS WELL AS SET IT!
		// =====================================================================
		const requestHeaders = [["Content-Type", "application/json"]];
		const id = encodeURIComponent(JSON.parse(data).id);
		// ------------------------------------------
		// Update a queue for the current company
		// -------------------------------------------
		return $http("PUT", `api/queues/customers/priorityStatus/${id}/?companyId=${zooqueue.companyId()}`, data, requestHeaders);
	}
	const $customerCreate = (data) => {
		const queueId = encodeURIComponent(zooqueue.getCurrentQueue().id);
		const requestHeaders = [["Content-Type", "application/json"]];
		// ------------------------------------------
		// Create a customer for the current queue
		// -------------------------------------------
		return $http("POST", `api/customers/${JSON.parse(data).id}/?companyId=${zooqueue.companyId()}&queueId=${queueId}`, data, requestHeaders);
	};
	const $customerServe = (data) => {
		const staffMember = JSON.parse(data).staffMember;
		const queueId = encodeURIComponent(zooqueue.getCurrentQueue().id);
		const requestHeaders = [["Content-Type", "application/json"]];
		// -------------------------------------------------------------------------------------------------
		// Serve next available customer in the queue that has a service supported by this staff member
		// -------------------------------------------------------------------------------------------------
		return $http("PUT", `api/customers/serve/${JSON.parse(data).customer.id}/?companyId=${zooqueue.companyId()}&queueId=${queueId}&staffMemberId=${staffMember.id}`, JSON.stringify(staffMember), requestHeaders);
	};
	const $customerServeComplete = (id) => {
		const queueId = encodeURIComponent(zooqueue.getCurrentQueue().id);
		// --------------------------------------------------------------------------------------
		// Finish serving customer:
		// 1. delete customer from staff member
		// 2. update staff member status
		// 3. TODO!!! send info about completed booking to bookingbug
		// --------------------------------------------------------------------------------------
		return $http("DELETE", `api/customers/serve/${id}/?companyId=${zooqueue.companyId()}&queueId=${queueId}`);
	};
	const $customerDelete = (id) => {
		const queueId = encodeURIComponent(zooqueue.getCurrentQueue().id);
		return $http("DELETE", `api/customers/${id}/?companyId=${zooqueue.companyId()}&queueId=${queueId}`);
	}
	const $servicesSet = (data) => {
		if (zooqueue.queryStringService().get("services") == 0) {
			data = JSON.stringify([]); // TEST: MOCK NO SERVICES FROM API
		}
		const requestHeaders = [["Content-Type", "application/json"]];
		// ------------------------------------------------------------------------------------
		// Update queuing services database with services available for the current company
		// ------------------------------------------------------------------------------------
		return $http("PUT", `api/services/?companyId=${zooqueue.companyId()}`, data, requestHeaders);
	};
	const $servicesGet = () => {
		// ------------------------------------------
		// Get all services for all child companies
		// -------------------------------------------
		return $http("GET", `api/services/?companyId=${zooqueue.companyId()}`);
	};
	const $staffSet = (data) => {
		if (zooqueue.queryStringService().get("staff") == 0) {
			data = JSON.stringify([]); // TEST: MOCK NO PEOPLE FROM API
		}
		const requestHeaders = [["Content-Type", "application/json"]];
		// ------------------------------------------------------------------------------------
		// Update queuing staff database with people available for the current company
		// ------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/?companyId=${zooqueue.companyId()}`, data, requestHeaders);
	};
	const $staffDeleteAll = () => {
		return $http("DELETE", `api/staff/?companyId=${zooqueue.companyId()}`);
	};
	const $staffSetBookings = (data) => {
		const requestHeaders = [["Content-Type", "application/json"]];
		// -------------------------------------------------------------------------------------------------------------
		// Update bookings in queuing staff database (with new bookings that we got back from bookingbug bookings api)
		// -------------------------------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/bookings/?companyId=${zooqueue.companyId()}`, data, requestHeaders);
	};
	const $staffGet = () => {
		// ------------------------------------------
		// Get all staff for all child companies
		// -------------------------------------------
		return $http("GET", `api/staff/?companyId=${zooqueue.companyId()}`);
	};
	const $staffMemberStartShift = (id) => {
		const actionType = "START_SHIFT";
		// -------------------------------------------------------------------------------------------------
		// set staff member attendance_status to available and set attendance_started to the current time
		// --------------------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/attendance/1_available/${id}/?companyId=${zooqueue.companyId()}&actionType=${actionType}`);
	};
	const $staffMemberSetFree = (id) => {
		const actionType = "SET_FREE";
		// -------------------------------------------------------------------------------------------------------
		// set staff member attendance_status to available and DO NOT set attendance_started to the current time
		// --------------------------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/attendance/1_available/${id}/?companyId=${zooqueue.companyId()}&actionType=${actionType}`);
	};
	const $staffMemberSetOnBreak = (id) => {
		// ------------------------------------------
		// set staff member on break for 15 minutes
		// TODO: staff can select the break duration
		// ------------------------------------------
		return $http("PUT", `api/staff/attendance/2_break/${id}/?companyId=${zooqueue.companyId()}`);
	};
	const $staffMemberSetBusy = (id) => {
		// ------------------------------------------------------
		// set staff member busy (other) - attendance_status 3
		// ------------------------------------------------------
		return $http("PUT", `api/staff/attendance/3_busy/${id}/?companyId=${zooqueue.companyId()}`);
	};
	// const $staffMemberSetBusy__4 = (data) => {
	// 	// --------------------------------------------------------
	// 	// set staff member busy (serving) - attendance_status 4
	// 	// --------------------------------------------------------
	// 	const id = data.id;
	// 	const staffMemberActiveBooking = data.activeBooking;
	// 	let requestHeaders = [["Content-Type", "application/json"]];
	// 	return $http("PUT", `api/staff/attendance/4_busy/${id}/?companyId=${zooqueue.companyId()}`, data, requestHeaders);
	// };
	const $staffMemberEndShift = (id) => {
		// ===================================
		// STAFF MEMBER END SHIFT
		// ===================================
		return $http("PUT", `api/staff/attendance/0_awol/${id}/?companyId=${zooqueue.companyId()}`);
	};

	return function () {
		return {
			convertQueueFormDataToJson(formData) {
				return $convertQueueFormDataToJson(formData);
			},
			convertCustomerFormDataToJson(formData) {
				return $convertCustomerFormDataToJson(formData);
			},
			connectionTest() {
				return $connectionTest();
			},
			queuesGet() {
				return new Promise((resolve, reject) => {
					$queuesGet().then( (queues) => {
						zooqueue.setQueues(JSON.parse(queues));
						resolve(JSON.parse(queues));
					}, err => {
						reject(err);
					});
				});
			},
			queueCreate(data) {
				return new Promise((resolve, reject) => {
					$queueCreate(data).then( (queues) => {

						if(JSON.parse(queues).error) {
							return reject(JSON.parse(queues).error);
						}

						zooqueue.setQueues(JSON.parse(queues));

						let queueIndex = zooqueue.getQueues()[zooqueue.companyIdAsKey()].length -1;
						zooqueue.setCurrentQueueIndex(queueIndex);

						resolve("q.db.json: updated");

					}, err => {
						reject(err);
					});
				});
			},
			queueSetPriorityCustomer(id = null) {
				return new Promise( (resolve, reject) => {
					const queue = zooqueue.getCurrentQueue();

					if (id) {
						queue.priorityCustomer = zooqueue.getCustomer(id);
					} else delete queue.priorityCustomer;

					$queueSetPriorityCustomer(JSON.stringify(queue)).then( (queues) => {
						resolve("q.db.json: updated");
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			},
			customerCreate(data) {
				return new Promise((resolve, reject) => {
					$customerCreate(data).then( (queues) => {

						if(JSON.parse(queues).error) {
							return reject(JSON.parse(queues).error);
						}

						zooqueue.setQueues(JSON.parse(queues));
						resolve("q.db.json: updated");

					}, err => {
						reject(err);
					});
				});
			},
			customerServe(data) {
				return new Promise( (resolve, reject) => {
					if (!data){
						return reject({error: data});
					}
					$customerServe(data).then( (data) => {

						if(JSON.parse(data).error) {
							return reject(JSON.parse(data).error);
						}

						zooqueue.setQueues(JSON.parse(data).queues);
						zooqueue.setStaff(JSON.parse(data).staff)
						resolve("q.db.json: updated, staff.db.json: updated");

					}, err => {
						reject(err);
					});
				});
			},
			customerServeComplete(data) {
				return new Promise( (resolve, reject) => {
					$customerServeComplete(data).then( (data) => {
						if (JSON.parse(data).error) {
							return reject(JSON.parse(data).error);
						}
						zooqueue.setQueues(JSON.parse(data).queues);
						zooqueue.setStaff(JSON.parse(data).staff);
						resolve("q.db.json updated, staff.db.json updated");
					});
				});
			},
			customerDelete(data) {
				return new Promise( (resolve, reject) => {
					$customerDelete(data).then( (data) => {
						if (JSON.parse(data).error) {
							return reject(JSON.parse(data).error);
						}
						zooqueue.setQueues(JSON.parse(data));
						resolve("q.db.json updated");
					}, err => {
						reject(err);
					});
				});
			},
			servicesSet(data) {
				return new Promise((resolve, reject) => {
					$servicesSet(data).then((services) => {

						if(JSON.parse(services).error) {
							return reject(JSON.parse(services).error);
						}

						zooqueue.setServices(JSON.parse(services));
						resolve("services.db.json: updated");

					}, err => {
						reject(err);
					});
				});
			},
			servicesGet() {
				return new Promise( (resolve, reject) => {
					$servicesGet().then( (services) => {
						if (JSON.parse(services).error) {
							return reject(JSON.parse(services).error);
						}
						zooqueue.setServices(JSON.parse(services));
						resolve(JSON.parse(services));
						// console.log(JSON.parse(services));
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			},
			staffSet(data) {
				return new Promise((resolve, reject) => {
					$staffSet(data).then((staff) => {
						if(JSON.parse(staff).error) {
							return reject(JSON.parse(staff).error);
						}
						zooqueue.setStaff(JSON.parse(staff));
						resolve("staff.db.json: updated");
					}, err => {
						reject(err);
					});
				});
			},
			staffGet() {
				return new Promise( (resolve, reject) => {
					$staffGet().then( (staff) => {
						if (JSON.parse(staff).error) {
							return reject(JSON.parse(staff).error);
						}
						zooqueue.setStaff(JSON.parse(staff));
						resolve(JSON.parse(staff));
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			},
			staffDeleteAll() {
				return new Promise( (resolve, reject) => {
					$staffDeleteAll().then( (result) => {
						resolve(result);
					}, err => {
						reject(err);
					});
				});
			},
			staffSetBookings(data) {
				return new Promise((resolve, reject) => {
					$staffSetBookings(data).then((staff) => {
						if(JSON.parse(staff).error) {
							return reject(JSON.parse(staff).error);
						}
						zooqueue.setStaff(JSON.parse(staff));
						resolve("staff.db.json: updated");
					}, err => {
						reject(err);
					});
				});
			},
			// staffMemberSetOnBreak(id) {
			// 	return new Promise( (resolve, reject) => {
			// 		$staffMemberSetOnBreak(id).then( (staff) => {
			// 			if (JSON.parse(staff).error) {
			// 				return reject(JSON.parse(staff).error);
			// 			}
			// 			zooqueue.setStaff(JSON.parse(staff));
			// 			resolve(JSON.parse(staff));
			// 		}, err => {
			// 			zooqueue.consoleError(err);
			// 			reject(err);
			// 		});
			// 	});
			// },
			staffMemberSetOnBreak(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberSetOnBreak(id).then( (result) => {
						zooqueue.consoleLog("staff.db.json: updated");
						resolve(JSON.parse(result));
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			},
			staffMemberSetBusy(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberSetBusy(id).then( (result) => {
						zooqueue.consoleLog("staff.db.json: updated");
						resolve(JSON.parse(result));
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			},
			// staffMemberSetBusy__4(data) {
			// 	return new Promise( (resolve, reject) => {
			// 		$staffMemberSetBusy__4(data).then( (result) => {
			// 			zooqueue.consoleLog("staff.db.json: updated");
			// 			resolve(JSON.parse(result));
			// 		}, err => {
			// 			zooqueue.consoleError(err);
			// 			reject(err);
			// 		})
			// 	}, err => {
			// 		zooqueue.consoleError(err);
			// 	});
			// },
			staffMemberStartShift(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberStartShift(id).then( (result) => {
						zooqueue.consoleLog("staff.db.json: updated");
						resolve(JSON.parse(result));
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			},
			staffMemberSetFree(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberSetFree(id).then( (result) => {
						zooqueue.consoleLog("staff.db.json: updated");
						resolve(JSON.parse(result));
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			},
			staffMemberEndShift(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberEndShift(id).then( (result) => {
						let staffMember = JSON.parse(result);
						console.log("updated staff member like: ", staffMember);
						zooqueue.setStaffMember(staffMember);
						resolve(result);
					}, err => {
						zooqueue.consoleError(err);
						reject(err);
					});
				});
			}
		}
	}
})();
