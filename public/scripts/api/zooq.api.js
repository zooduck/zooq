const zooqApi = (function zooqApi () {
	const $getLastTicketRef = (serviceCode = null) => {
		const customersInQueue = zooq.getCurrentQueue().customers;
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
		let serviceCode = zooq.getService(serviceId).code;
		let queueCode = zooq.getCurrentQueue().code;
		switch (ticketRef.toString().length) {
			case 1: ticketRef = `00${ticketRef}`; break;
			case 2: ticketRef = `0${ticketRef}`; break;
		}
		return serviceCode? `${ticketRef}${queueCode}:${serviceCode}` : ticketRef;
	};
	const $convertQueueFormDataToJson = (formData) => {
		const data = {
			id: zooq.generateUniqueId(),
			companyId: zooq.companyId(),
			customers: [],
			customersBeingServed: [],
			serviceIds: []
		};
		for (let pair of formData) {
			let key = pair[0];
			let val = pair[1];
			if (key == "serviceId") {
				let serviceId = parseInt(val);
				data.serviceIds.push(serviceId);
			} else data[key] = val;
		}

		// ==================
		// FORM VALIDATION
		// ==================
		if (data.name.trim() == "" || !data.serviceIds[0]) {
			zooq.alert("QUEUE_FORM_QUEUE_NAME_OR_SERVICE_INVALID");
			return {error: "$convertQueueFormDataToJson() failed"};
		}

		return JSON.stringify(data);
	};
	const $convertCustomerFormDataToJson = (formData) => {
		const queue = zooq.getCurrentQueue();
		const queueBasic = {
			id: queue.id,
			name: queue.name
		}
		const nowDate = luxon.DateTime.local();
		const data = {
			id: zooq.generateUniqueId(),
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
				let service = zooq.getService(serviceId);
				data.services.push(service);
			} else data[key] = val;
		}

		// ==================
		// FORM VALIDATION
		// ==================
		if (!data.services[0] || !data.firstName) {
			zooq.alert("CUSTOMER_FORM_FIRST_NAME_OR_SERVICE_INVALID");
			return {error: "$convertCustomerFormDataToJson() failed"};
		}

		const service = zooq.getService(data.services[0].id);
		const lastTicketRef = $getLastTicketRef(service.code);
		data.ticketRef = $generateTicketRef(lastTicketRef, service.id);

		const serviceCode = data.ticketRef.split("").pop();
		const ticketRefCode = data.ticketRef.match(/\D+/);
		const ticketRefNumber = data.ticketRef.match(/\d+/);
		data.ticketRefDisplay = `${ticketRefCode[0]}${ticketRefNumber[0]}`;

		return JSON.stringify(data);
	};
	const $connectionTest = () => {
		return $http("GET", `api/connection/test`);
	};
	const $queuesGet = () => {
		// ------------------------------------------
		// Get all queues for all child companies
		// -------------------------------------------
		return $http("GET", `api/queues/?companyId=${zooq.companyId()}`);
	};
	const $queueCreate = (data) => {
		// ------------------------------------------
		// Create a queue for the current company
		// -------------------------------------------
		const requestHeaders = [["Content-Type", "application/json"]];
		const id = encodeURIComponent(JSON.parse(data).id);
		return $http("POST", `api/queues/${id}/?companyId=${zooq.companyId()}`, data, requestHeaders);
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
		return $http("PUT", `api/queues/customers/priorityStatus/${id}/?companyId=${zooq.companyId()}`, data, requestHeaders);
	}
	const $customerCreate = (data) => {
		// const queueId = encodeURIComponent(zooq.getCurrentQueue().id);
		const queueId = encodeURIComponent(JSON.parse(data).queue.id);
		const requestHeaders = [["Content-Type", "application/json"]];
		// ------------------------------------------
		// Create a customer for the current queue
		// -------------------------------------------
		return $http("POST", `api/customers/${JSON.parse(data).id}/?companyId=${zooq.companyId()}&queueId=${queueId}`, data, requestHeaders);
	};
	const $customerServe = (data) => {
		const staffMember = JSON.parse(data).staffMember;
		const queueId = encodeURIComponent(zooq.getCurrentQueue().id);
		const requestHeaders = [["Content-Type", "application/json"]];
		// -------------------------------------------------------------------------------------------------
		// Serve next available customer in the queue that has a service supported by this staff member
		// -------------------------------------------------------------------------------------------------
		return $http("PUT", `api/customers/serve/${JSON.parse(data).customer.id}/?companyId=${zooq.companyId()}&queueId=${queueId}&staffMemberId=${staffMember.id}`, data, requestHeaders);
	};
	const $customerServeComplete = (staffMember) => {
		const id = staffMember.id;
		const queueId = encodeURIComponent(staffMember.activeQueue.id || zooq.getCurrentQueue().id);
		const customerId = staffMember.serving[0].id;
		// -----------------------------------------------------------
		// Finish serving customer:
		// 1. delete customer from staff member
		// 2. update staff member status
		// 3. TODO: store details of completed booking in database
		// -----------------------------------------------------------
		return $http("DELETE", `api/customers/serve/${id}/?companyId=${zooq.companyId()}&queueId=${queueId}&customerId=${customerId}`);
	};
	const $customerDelete = (id) => {
		const queueId = encodeURIComponent(zooq.getCurrentQueue().id);
		return $http("DELETE", `api/customers/${id}/?companyId=${zooq.companyId()}&queueId=${queueId}`);
	}
	const $servicesSet = (data) => {
		if (zooq.queryStringService().get("services") == 0) {
			data = JSON.stringify([]); // TEST: MOCK NO SERVICES FROM API
		}
		const requestHeaders = [["Content-Type", "application/json"]];
		// ------------------------------------------------------------------------------------
		// Update queuing services database with services available for the current company
		// ------------------------------------------------------------------------------------
		return $http("PUT", `api/services/?companyId=${zooq.companyId()}`, data, requestHeaders);
	};
	const $servicesGet = () => {
		// ------------------------------------------
		// Get all services for all child companies
		// -------------------------------------------
		return $http("GET", `api/services/?companyId=${zooq.companyId()}`);
	};
	const $staffSet = (data) => {
		if (zooq.queryStringService().get("staff") == 0) {
			data = JSON.stringify([]); // TEST: MOCK NO STAFF FROM API
		}
		const requestHeaders = [["Content-Type", "application/json"]];
		// ------------------------------------------------------------------------------------
		// Update queuing staff database with staff available for the current company
		// ------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/?companyId=${zooq.companyId()}`, data, requestHeaders);
	};
	const $staffSetBookings = (data) => {
		const requestHeaders = [["Content-Type", "application/json"]];
		// -------------------------------------------------------------------------------------------------------------
		// Update bookings in queuing staff database (with new bookings that we got back from external bookings api)
		// -------------------------------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/bookings/?companyId=${zooq.companyId()}`, data, requestHeaders);
	};
	const $staffGet = () => {
		// ------------------------------------------
		// Get all staff for all child companies
		// -------------------------------------------
		return $http("GET", `api/staff/?companyId=${zooq.companyId()}`);
	};
	const $staffMemberStartShift = (id) => {
		const actionType = "START_SHIFT";
		// -------------------------------------------------------------------------------------------------
		// set staff member attendance_status to available and set attendance_started to the current time
		// --------------------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/attendance/1_available/${id}/?companyId=${zooq.companyId()}&actionType=${actionType}`);
	};
	const $staffMemberSetFree = (id) => {
		const actionType = "SET_FREE";
		// -------------------------------------------------------------------------------------------------------
		// set staff member attendance_status to available and DO NOT set attendance_started to the current time
		// --------------------------------------------------------------------------------------------------------
		return $http("PUT", `api/staff/attendance/1_available/${id}/?companyId=${zooq.companyId()}&actionType=${actionType}`);
	};
	const $staffMemberSetOnBreak = (id) => {
		// ------------------------------------------
		// set staff member on break for 15 minutes
		// TODO: staff can select the break duration
		// ------------------------------------------
		return $http("PUT", `api/staff/attendance/2_break/${id}/?companyId=${zooq.companyId()}`);
	};
	const $staffMemberSetBusy = (id) => {
		// ------------------------------------------------------
		// set staff member busy (other) - attendance_status 3
		// ------------------------------------------------------
		return $http("PUT", `api/staff/attendance/3_busy/${id}/?companyId=${zooq.companyId()}`);
	};
	const $staffMemberEndShift = (id) => {
		// ===================================
		// STAFF MEMBER END SHIFT
		// ===================================
		return $http("PUT", `api/staff/attendance/0_awol/${id}/?companyId=${zooq.companyId()}`);
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
						zooq.setQueues(JSON.parse(queues));
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
						zooq.setQueues(JSON.parse(queues));
						let queueIndex = zooq.getQueues()[zooq.companyIdAsKey()].length -1;
						zooq.setCurrentQueueIndex(queueIndex);
						zooq.consoleLog("DATABASE_UPDATE: q");
						resolve("DATABASE_UPDATE: q");
					}, err => {
						reject(err);
					});
				});
			},
			queueSetPriorityCustomer(id = null) {
				return new Promise( (resolve, reject) => {
					const queue = zooq.getCurrentQueue();

					if (id) {
						queue.priorityCustomer = zooq.getCustomer(id);
					} else delete queue.priorityCustomer;

					$queueSetPriorityCustomer(JSON.stringify(queue)).then( (queues) => {
						zooq.consoleLog("DATABASE_UPDATE: q");
						resolve("DATABASE_UPDATE: q");
					}, err => {
						zooq.consoleError(err);
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
						zooq.setQueues(JSON.parse(queues));
						zooq.consoleLog("DATABASE_UPDATE: q");
						resolve("DATABASE_UPDATE: q");
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
						zooq.consoleLog("DATABASE_UPDATE: [q, staff]");
						resolve("DATABASE_UPDATE: [q, staff]");
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
						zooq.consoleLog("DATABASE_UPDATE: [q, staff]");
						resolve("DATABASE_UPDATE: [q, staff]");
					});
				});
			},
			customerDelete(data) {
				return new Promise( (resolve, reject) => {
					$customerDelete(data).then( (data) => {
						if (JSON.parse(data).error) {
							return reject(JSON.parse(data).error);
						}
						zooq.setQueues(JSON.parse(data));
						zooq.consoleLog("DATABASE_UPDATE: q");
						resolve("DATABASE_UPDATE: q");
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
						zooq.setServices(JSON.parse(services));
						zooq.consoleLog("DATABASE_UPDATE: services");
						resolve("DATABASE_UPDATE: services");
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
						zooq.setServices(JSON.parse(services));
						resolve(JSON.parse(services));
					}, err => {
						zooq.consoleError(err);
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
						zooq.setStaff(JSON.parse(staff));
						zooq.consoleLog("DATABASE_UPDATE: staff");
						resolve("DATABASE_UPDATE: staff");
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
						zooq.setStaff(JSON.parse(staff));
						resolve(JSON.parse(staff));
					}, err => {
						zooq.consoleError(err);
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
						zooq.setStaff(JSON.parse(staff));
						zooq.consoleLog("DATABASE_UPDATE: staff");
						resolve("DATABASE_UPDATE: staff");
					}, err => {
						reject(err);
					});
				});
			},
			staffMemberSetOnBreak(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberSetOnBreak(id).then( (result) => {
						zooq.consoleLog("DATABASE_UPDATE: staff");
						resolve(JSON.parse(result));
					}, err => {
						zooq.consoleError(err);
						reject(err);
					});
				});
			},
			staffMemberSetBusy(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberSetBusy(id).then( (result) => {
						zooq.consoleLog("DATABASE_UPDATE: staff");
						resolve(JSON.parse(result));
					}, err => {
						zooq.consoleError(err);
						reject(err);
					});
				});
			},
			staffMemberStartShift(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberStartShift(id).then( (result) => {
						zooq.consoleLog("DATABASE_UPDATE: staff");
						resolve(JSON.parse(result));
					}, err => {
						zooq.consoleError(err);
						reject(err);
					});
				});
			},
			staffMemberSetFree(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberSetFree(id).then( (result) => {
						const staffMember = JSON.parse(result);
						zooq.consoleLog("DATABASE_UPDATE: staff");
						resolve(staffMember);
					}, err => {
						zooq.consoleError(err);
						reject(err);
					});
				});
			},
			staffMemberEndShift(id) {
				return new Promise( (resolve, reject) => {
					$staffMemberEndShift(id).then( (result) => {
						const staffMember = JSON.parse(result);
						zooq.setStaffMember(staffMember);
						zooq.consoleLog("DATABASE_UPDATE: staff");
						resolve(staffMember);
					}, err => {
						zooq.consoleError(err);
						reject(err);
					});
				});
			}
		}
	}
})();
