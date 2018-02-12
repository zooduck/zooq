function ZooQueue() {
	// ========================
	// object definitions...
	// ========================
	function Service (data) {
		for (let i in data) {
			this[i] = data[i];
		}
	}
	function StaffMember (data) {
		for (let i in data) {
			this[i] = data[i];
		}
		return this;
	}
	function Queue (data) {
		for (let i in data) {
			this[i] = data[i];
		}
	}
	function Customer (data) {
		for (let i in data) {
			this[i] = data[i];
		}
	}
	// ====================
	// private vars...
	// ====================
	let started = false;
	let bookingbugApiUrl__PUBLIC = "https://starfox.bookingbug.com/api/v1/";
	let bookingbugApiUrl__ADMIN = "https://starfox.bookingbug.com/api/v1/admin/";
	let bookingbugApi__POLL_DELAY = 15000; // 15 seconds
	let queues = [];
	let staff = [];
	let services = [];
	let customers = [];
	let currentQueue = {};
	let currentQueueIndex = 0;
	let filters = {};
	let lastQueuesData = null;
	let lastStaffData = null;
	let lastServicesData = null;
	let priorityCustomers = {}
	let alertKeys = {
	  ERROR_GENERIC: "Unknown error occured. Please replace the handset and try again.",
	  CUSTOMER_TO_SERVE_NOT_FOUND: "There are no customers to serve.",
		SERVICE_NOT_SUPPORTED: "You are not qualified to serve the priority customer.",
		CUSTOMER_FORM_FIRST_NAME_OR_SERVICE_INVALID: "Please enter a first name and select a service.",
		QUEUE_FORM_QUEUE_NAME_OR_SERVICE_INVALID: "Please enter a name for the queue and assign at least one service.",
		PRIORITY_CUSTOMER_CANNOT_BE_DELETED: "Priority customers cannot be removed from the queue.",
		QUEUE_NOT_FOUND: "No queue found. Please check that you have created a queue before trying to add a customer."
	}
	let alertTimeout = null;
	// =====================
	// private methods...
	// =====================
	const $alertService = (key = "", msg = "BANANAS") => {
		const message = alertKeys[key]? alertKeys[key] : msg;
		zooqueue.elements("alertMessage").innerHTML = message;
		zooqueue.elements("alert").classList.add("--active");
		if (alertTimeout) clearTimeout(alertTimeout);
		alertTimeout = setTimeout( () => zooqueue.elements("alert").classList.remove("--active"), 5000);
	};
	const $queryStringService = (function() {
		let qStrings = location.search.replace("?", "").split("&");
		let qStringsObj = {}
		for (let pair of qStrings) {
			let key = pair.split("=")[0];
			let val = pair.split("=")[1];
			qStringsObj[key] = val;
		}
		return function () {
			return {
				get: (key) => {
					return qStringsObj[key];
				}
			}
		}
	})();
	const $generateUniqueIdService= () => {
		return `${new Date().getTime()}.${Math.random().toString().replace(/\./g, "")}`;
	};
	const $setCurrentQueue = () => {
		if (this.hasQueues()) {
			currentQueue = queues[this.companyIdAsKey()][currentQueueIndex];
		}
	};
	const $sortStaffByAppointmentTimeLeft = (staffCopy) => {
		// -------------------------------------------------------------------------
		// staff must be sorted by "appointmentTimeLeft", so the staff with the least
		// time left on their current appointment are first in the array
		// -------------------------------------------------------------------------
		staffCopy.sort( (staffMemberA, staffMemberB) => {
			return staffMemberA.appointmentTimeLeft - staffMemberB.appointmentTimeLeft;
		});
	};
	// ===========================
	// SET ESTIMATED WAIT TIMES
	// ===========================
	const $unshiftPriorityCustomer = (customers__COPY) => {
		if (zooqueue.hasPriorityCustomer()) {
			const priorityCustomerIndex = customers__COPY.findIndex( (item) => item.id == zooqueue.getCurrentQueue().priorityCustomer.id);
			if (priorityCustomerIndex != -1) {
				const priorityCustomer = customers__COPY.splice(priorityCustomerIndex, 1);
				customers__COPY.unshift(priorityCustomer[0]); // NOTE: Array.splice returns an Array!
			}
		}
		return customers__COPY;
	};
	const $sortStaffByAttendanceStatus = (staff__COPY) => {
		const staffAwol = staff__COPY.filter( (item) => item.attendance_status == 0); // always last
		const staffFree = staff__COPY.filter( (item) => item.attendance_status == 1); // always first
		const staffBusy = staff__COPY.filter( (item) => item.attendance_status == 2 || item.attendance_status == 3 || item.attendance_status == 4); // always complicated
		const staffSorted = staffFree.concat(staffBusy);
		// ===========================================================================
		// NOTE: staff that are awol (not on shift) should never enter the equation!
		// ===========================================================================
		staff__COPY = staffSorted;
		return staff__COPY;
	};
	const $calcMinutesUntilFree = (data) => {
		if (!data) {
			return 0;
		}
		// ----------------------------------------------------------
		// NOTE: data = activeBreak, activeBusy or activeBooking
		// ----------------------------------------------------------
		let startDate = luxon.DateTime.fromISO(data.datetime);
		let endDate = startDate.plus({minutes: data.duration});
		let diff = endDate.diffNow();
		// -------------------------------------------------------------------------------------------
		// NOTE: luxon Duration should be able to return minutes, hours, seconds etc.
		// but it is currently broken and can only return milliseconds (I should tell the author!)
		// --------------------------------------------------------------------------------------------
		let minutesUntilFree = diff.milliseconds / 1000 / 60; // have to do this because luxon Duration is broken =(
		if (minutesUntilFree < 0) {
			minutesUntilFree = 0;
		}
		return minutesUntilFree;
	};
	const $initMinutesUntilFree = (staff__COPY) => {
		const nowDate = luxon.DateTime.local();
		for (const staffMember of staff__COPY) {
			if (staffMember.attendance_status == 1) {
				staffMember.minutesUntilFree = 0;
			}
			if (staffMember.attendance_status == 2) {
				const minutesUntilFree = $calcMinutesUntilFree(staffMember.activeBreak);
				staffMember.minutesUntilFree = minutesUntilFree;
			}
			if (staffMember.attendance_status == 3) {
				const minutesUntilFree = $calcMinutesUntilFree(staffMember.activeBusy);
				staffMember.minutesUntilFree = minutesUntilFree;
			}
			if (staffMember.attendance_status == 4) {
				const minutesUntilFree = $calcMinutesUntilFree(staffMember.activeBooking);
				staffMember.minutesUntilFree = minutesUntilFree;
			}
		}
		return staff__COPY;
	};
	const $setEstimatedWaitTimes = () => {
		// ==========================================================================
		// 1. create copies of staff and customers (anything we do here STAYS here)
		// ==========================================================================
		let staff__COPY = [];
		for (let staffMember of zooqueue.getStaff()[zooqueue.companyIdAsKey()]) {
			staff__COPY.push(Object.assign({}, staffMember));
		}
		let customers__COPY = [];
		for (let customer of zooqueue.getCurrentQueue().customers) {
			customers__COPY.push(Object.assign({}, customer));
		}
		// ===========================================================
		// 2. IF there is a priority customer, we need to move them
		// to the top of the queue (0 index in customers array)
		// ===========================================================
		customers__COPY = $unshiftPriorityCustomer(customers__COPY);
		// ================================================================
		// 3. initially sort the staff based on "attendance_status" ONLY
		// ================================================================
		staff__COPY = $sortStaffByAttendanceStatus(staff__COPY);
		// ============================================================
		// 4. now that we have sorted staff and customers, we can
		// initialise a "minutesUntilFree" prop on each staff member
		// ============================================================
		staff__COPY = $initMinutesUntilFree(staff__COPY);
		// =========================================================================
		// 5. set "estimatedWaitTime" and "nextAvailableStaffMember" on customers
		// =========================================================================
		for (const customer of customers__COPY) {
			// ========================================================
			// 5.1. find all staff that support the customer's service
			// ========================================================
			const staffWithCustomerService = staff__COPY.filter( (item) => item.service_ids.indexOf(customer.services[0].id) != -1);
			// ======================================================
			// 5.2. sort those staff by their "minutesUntilFree" prop
			// ======================================================
			staffWithCustomerService.sort( (a, b) => a.minutesUntilFree - b.minutesUntilFree);
			// ================================================
			// 5.3.set "estimatedWaitTime" on customer
			// AND update "minutesUntilFree" on staff member
			// ================================================
			if (staffWithCustomerService.length > 0) {
				customer.estimatedWaitTime = staffWithCustomerService[0].minutesUntilFree;
				customer.nextAvailableStaffMember = staffWithCustomerService[0];
				staffWithCustomerService[0].minutesUntilFree += customer.services[0].durations[0];
			} else customer.estimatedWaitTime = "FOREVER_AND_A_DAY";
		}
		// ==========================================================================================================
		// 6. set "estimatedWaitTime" and "nextAvailableStaffMember" for each customer in the REAL customers array
		// ==========================================================================================================
		for (const customer of zooqueue.getCurrentQueue().customers) {
			customer.estimatedWaitTime = customers__COPY.find( (item) => item.id == customer.id).estimatedWaitTime;
			customer.nextAvailableStaffMember = customers__COPY.find( (item) => item.id == customer.id).nextAvailableStaffMember;
		}
	}; // SET ESTIMATED WAIT TIMES

	// ==========================================
	// SET BOOKINGS ON STAFF (ISOLATED METHODS)
	// ==========================================
	const $bookingInProgress = (booking) => {
		const nowDate = luxon.DateTime.local();
		const bookingStartDate = luxon.DateTime.fromISO(booking.datetime);
		const bookingEndDate = luxon.DateTime.fromISO(booking.end_datetime);
		const interval = luxon.Interval.fromDateTimes(bookingStartDate, bookingEndDate);
		const bookingInProgress = interval.start < nowDate && interval.end> nowDate;
		return bookingInProgress;
	};
	const $staffMemberActiveBooking__RESET = (staffMember) => {
		staffMember.activeBooking = null;
		staffMember.activeBookingType = null;
		return staffMember;
	};
	const $deleteCancelledBookingsOnStaffMember = (bookingbugBookings, staffMember) => {
		if (staffMember.calendarBookings) {
			let bookingbugBookingsIds = bookingbugBookings.map( (item) => item.id);
			filteredCalendarBookings = staffMember.calendarBookings.filter( (item) => bookingbugBookingsIds.indexOf(item.id) != -1);
			staffMember.calendarBookings = filteredCalendarBookings;
		}
	};
	const $applyMovedCalendarBookingsOnStaffMember = (bookingbugBookings, staffMember) => {
		for (booking of bookingbugBookings) {
			// ======================
			// 1. ADD NEW BOOKING
			// ======================
			let bookingExistsIndex = staffMember.calendarBookings? staffMember.calendarBookings.findIndex( (item, index, arr) => item.id == booking.id) : -1;
			if (bookingExistsIndex == -1) {
				staffMember.calendarBookings? staffMember.calendarBookings.push(booking) : staffMember.calendarBookings = [booking];
				console.warn(`ADD new calendar booking for ${staffMember.name}`);
			}
			// ==========================
			// 2. MODIFY MOVED BOOKING
			// ==========================
			if (bookingExistsIndex != -1 && (staffMember.calendarBookings[bookingExistsIndex].updated_at != booking.updated_at)) {
				// replace old with new
				staffMember.calendarBookings.splice(bookingExistsIndex, 1, booking);
				console.warn(`MODIFY moved calendar booking for ${staffMember.name}`);
			}
			// ====================================================================================
			// IS BOOKING CURRENTLY IN PROGRESS AND STAFF MEMBER HAS NO CURRENT ACTIVE BOOKING?
			// THEN: SET ACTIVE BOOKING TO THE CURRENT IN PROGRESS BOOKING IN CALENDAR
			// ====================================================================================
			if (!staffMember.activeBooking && $bookingInProgress(booking)) {
				console.warn(`SET calendar booking as active booking for ${staffMember.name}`);
				staffMember.activeBooking = booking;
				staffMember.activeBookingType = "CALENDAR";
			}
		}
	};

	const $updateActiveBookingOnStaffMember = (bookingbugBookings, staffMember) => {
		// ============================
		// UPDATE IF ALREADY EXISTS
		// ============================
		if (staffMember.activeBooking && staffMember.activeBookingType == "CALENDAR") {
			let activeBookingInCalendar = bookingbugBookings.find( (item) => item.id == staffMember.activeBooking.id);
			if (activeBookingInCalendar) {
				staffMember.activeBooking = activeBookingInCalendar;
				console.warn(`SET activeBooking to the one in calendar for ${staffMember.name}`);
			}
			// ============================
			// RESET IF NO LONGER ACTIVE
			// ============================
			const nowDate = luxon.DateTime.local();
			const startDate = luxon.DateTime.fromISO(staffMember.activeBooking.datetime);
			const endDate = luxon.DateTime.fromISO(staffMember.activeBooking.end_datetime);
			const interval = luxon.Interval.fromDateTimes(startDate, endDate);
			if (interval.isBefore(nowDate) || interval.isAfter(nowDate)) {
					staffMember = $staffMemberActiveBooking__RESET(staffMember);
					console.warn(`DELETE active calendar booking (NO_LONGER_ACTIVE) for ${staffMember.name}`);
			}
		}
		if (staffMember.activeBooking && !staffMember.activeBookingType) {
			// ===========================================================
			// SOMETHING WENT WRONG! (SO JUST RESET THE ACTIVE BOOKING)
			// ===========================================================
			staffMember = $staffMemberActiveBooking__RESET(staffMember);
			console.warn(`DELETE active calendar booking (NO_ACTIVE_BOOKING_TYPE) for ${staffMember.name}`);
		}
	};
	const $setNextBookingOnStaffMember = (staffMember) => {
		// ==========================================================
		// SET NEXT BOOKING TO THE EARLIEST BOOKING IN THE FUTURE
		// ==========================================================
		if (staffMember.calendarBookings) {
			staffMember.calendarBookings.sort( (a, b) => luxon.DateTime.fromISO(a.datetime) - luxon.DateTime.fromISO(b.datetime));
			let nextBooking = staffMember.calendarBookings.find( (item) => luxon.DateTime.fromISO(item.datetime) > luxon.DateTime.local());
			if (nextBooking) {
				staffMember.nextBooking = nextBooking;
				console.warn(`SET next booking for ${staffMember.name} to ${staffMember.nextBooking.full_describe}`);
			} else if (staffMember.nextBooking){
				staffMember.nextBooking = null;
				console.warn(`DELETE next booking (NO_CALENDAR_BOOKINGS_IN_FUTURE) from ${staffMember.name}`);
			}
		} else if (staffMember.nextBooking){
			staffMember.nextBooking = null;
			console.warn(`DELETE next booking (NO_CALENDAR_BOOKINGS) from ${staffMember.name}`);
		}
	}
	// ========================================
	// SET BOOKINGS ON STAFF (CALLBACK)
	// ========================================
	const $setBookingsOnStaff = (bookingbugBookings, staff) => {
		const staffOld = staff.map( (item) => Object.assign(new StaffMember({}), item));
		for (const staffMember of staff) {
			let bookingsForThisStaffMember = bookingbugBookings.filter( (item) => item.person_id == staffMember.id);
			// -----------------------------
			// sort bookings by datetime
			// -----------------------------
			bookingsForThisStaffMember.sort( (a, b) => luxon.DateTime.fromISO(a.datetime) - luxon.DateTime.fromISO(b.datetime));
			// ======================================================================
			// DELETE CANCELLED BOOKINGS FROM THIS STAFF MEMBER'S CALENDAR BOOKINGS
			// ======================================================================
			$deleteCancelledBookingsOnStaffMember(bookingsForThisStaffMember, staffMember);
			// =====================================================================
			// UPDATE ANY MOVED BOOKINGS IN THIS STAFF MEMBER'S CALENDAR BOOKINGS
			// =====================================================================
			$applyMovedCalendarBookingsOnStaffMember(bookingsForThisStaffMember, staffMember);
			// ===================
			// SET NEXT BOOKING
			// ===================
			$setNextBookingOnStaffMember(staffMember);
			// ===================================================================
			// UPDATE ACTIVE BOOKING IF EXISTS (MAYBE IT WAS MOVED OR CANCELLED)
			// ===================================================================
			$updateActiveBookingOnStaffMember(bookingsForThisStaffMember, staffMember);
		}
		// console.log("staffOld and staff same?", _.isEqual(staffOld, staff));
		return _.isEqual(staffOld, staff);
	}
	// ============================================================================
	// GENERATE A BOOKINGBUG ACCEPTED BASKET (REQ'D BY BOOKINGBUG CHECKOUT API)
	// ============================================================================
	const $buildBookingbugBasket = (data) => {
		const bbBasket = {
			client: {
				first_name: data.client.first_name,
				last_name: data.client.last_name,
				country: "United Kingdom",
				email: data.client.email,
				id: data.client.id, // for bookingbug to accept the booking, a valid id for a current client must be passed in
				mobile: data.client.mobile,
				mobile_prefix: "44",
				questions: data.client.questions,
				extra_info: data.client.extra_info,
				default_company_id: data.client.default_company_id
			},
			is_admin: true,
			items: [
					{
						date: data.item.date, // the date in format 2018-01-16
						time: data.item.time, // the time in format of minutes
						company_id: data.item.company_id,
						price: 0,
						book: `${bookingbugApiUrl__PUBLIC}${data.item.company_id}/basket/add_item?service_id=${data.item.service_id}`,
						duration: data.item.duration,
						settings: { resource: -1, person: data.item.person_id },
						child_client_ids: [],
						service_id: data.item.service_id,
						person_id: data.item.person_id,
						status: 4,
						ref: 0
					}
				]
			}
		return bbBasket;
	};
	// ======================
	// public methods...
	// ======================
	this.setReady = function () {
		started = true;
	}
	this.isReady = function () {
		return started;
	}
	this.alert = function (type, message) {
		return $alertService(type, message);
	}
	this.generateUniqueId = function () {
		return $generateUniqueIdService();
	}
	this.data = function () {
		return { staff: staff, services: services, queues: queues }
	}
	this.setLastQueuesData = function (data) {
		lastQueuesData = data;
	}
	this.setLastServicesData = function (data) {
		lastServicesData = data;
	}
	this.setLastStaffData = function (data) {
		lastStaffData = data;
	}
	this.getLastQueuesData = function () {
		return lastQueuesData;
	}
	this.getLastServicesData = function () {
		return lastServicesData;
	}
	this.getLastStaffData = function () {
		return lastStaffData;
	}
	this.bookingbugApi__POLL_DELAY = function () {
		return bookingbugApi__POLL_DELAY;
	}
	this.bookingbugApiUrl__ADMIN = function () {
		return bookingbugApiUrl__ADMIN;
	}
	this.bookingbugApiUrl__PUBLIC = function () {
		return bookingbugApiUrl__PUBLIC;
	}
	this.buildBookingbugBasket = function (data) {
		return $buildBookingbugBasket(data);
	}
	this.queryStringService = function () {
		return $queryStringService();
	}
	this.companyId = function () {
		return $queryStringService().get("companyId") || 37001;
	}
	this.companyIdAsKey = function () {
		return `_${this.companyId()}`;
	}
	this.getCompanyId = function () {
		return this.companyId();
	}
	this.getCurrentQueue = function () {
		return currentQueue;
	}
	this.getCurrentQueueIndex = function () {
		return currentQueueIndex;
	}
	this.setCurrentQueueIndex = function (data) {
		if (currentQueueIndex != data) {
			currentQueueIndex = data;
			$setCurrentQueue();
		}
	}
	this.setQueues = function (data) {
		// set queue objects to be of type "Queue"
		for (let key in data) {
			let queueCollection = data[key];
			let queueObjects = [];
			for (let queue of queueCollection) {			
				queueObjects.push(new Queue(queue));
			}
			data[key] = queueObjects;
		}
		queues = data;
		$setCurrentQueue();
	}
	this.getQueues = function () {
		return queues || [];
	}
	this.hasQueues = function () {
		return (queues && queues[this.companyIdAsKey()] && queues[this.companyIdAsKey()].length > 0) || false;
	}
	this.getCustomer = function (id) {
		return this.getCurrentQueue().customers.find( (item) => item.id == id);
	}
	this.getCustomers = function () {
		return this.getCurrentQueue().customers || [];
	}
	this.setStaff = function (data) {
		let obj = {}
		Object.assign(obj, data);
		// filter out staff with queuing_disabled (should already be done by api anyway)
		for (let key in data) {
			data[key] = data[key].filter(function(staffMember) {
				return !staffMember.queuing_disabled;
			});
		}
		// =======================================================
		// set staff member objects to be of type "StaffMember"
		// =======================================================
		for (let key in data) {
			let staffCollection = data[key];
			let staffMemberObjects = [];
			for (let staffMember of staffCollection) {
				staffMemberObjects.push(new StaffMember(staffMember));
			}
			data[key] = staffMemberObjects;
		}
		// =================================================================
		// sort staff - send all staff with attendance_status of 0 to end
		// =================================================================
		for (let key in data) {
			let staffCollection = data[key];
			let awolStaff = staffCollection.filter( (item) => item.attendance_status == 0 );
			let otherStaff = staffCollection.filter( (item) => item.attendance_status != 0);
			data[key] = otherStaff.concat(awolStaff);
		}
		staff = data;
	}
	this.setStaffMember = function (staffMember) {
		let staff = this.getStaff();
		for (let key in staff) {
			let staffCollection = staff[key];
			for (let item of staffCollection) {
				if (item.id == staffMember.id) {
					item = staffMember;
				}
			}
			let staffMemberIndex = staffCollection.findIndex( (item) => item.id == staffMember.id);
			if (staffMemberIndex) {
				staff[key][staffMemberIndex] = staffMember;
				break;
			}
		}
		this.setStaff(staff);
	}
	this.getStaff = function () {
		return staff || [];
	}
	this.getStaffMember = function (id) {
		return staff[this.companyIdAsKey()].find( (item) => {
			return item.id == id;
		}) || {}
	}
	this.hasStaff = function () {
		return staff[this.companyIdAsKey()] && staff[this.companyIdAsKey()].length > 0 || false;
	}
	// this.updateServicesInQueues = function () {
	// 	let allQueues = this.getQueues();
	// 	let services = this.getServices();
	//
	// 	for (let key in allQueues) {
	// 		let queues = allQueues[key];
	// 		// =========================================================================================
	// 		// NOTE: because each queue has its own array of services
	// 		// (which will invariably be different to the array of ALL services WITH queuing enabled)
	// 		// we have to do some kind of mapping to any changed props on THAT service in THIS queue
	// 		// =========================================================================================
	// 		for (let queue of queues) {
	// 			queue.services.map( (item) => {
	// 				let service = this.getService(item.id);
	// 				if (!service) {
	// 					// service has been deleted or its queuing_disabled prop changed to true
	// 					delete item;
	// 				} else {
	// 					// -----------------------------------------------
	// 					// we only care about changes to name or colour
	// 					// -----------------------------------------------
	// 					item.name = service.name;
	// 					item.colour = service.colour;
	// 				}
	// 			});
	// 		}
	// 	}
	// }
	this.setServices = function (data) {
		for (let key in data) {
			data[key] = data[key].filter(function(service) {
				return !service.queuing_disabled;
			});
		}
		// ===============================================
		// set service objects to be of type "Service"
		// ===============================================
		for (let key in data) {
			let serviceCollection = data[key];
			let serviceObjects = [];
			for (let service of serviceCollection) {
				serviceObjects.push(new Service(service));
			}
			data[key] = serviceObjects;
		}
		services = data;
		// this.updateServicesInQueues();
	}
	// this.getService = function (id) {
	// 	return services.find( (item) => item.id == id);
	// }
	this.getServices = function () {
		return services || [];
	}
	this.hasServices = function () {
		return services[this.companyIdAsKey()] && services[this.companyIdAsKey()].length > 0 || false;
	}
	this.getService = function (id) {
		let services = this.getServices()[this.companyIdAsKey()];
		let service = services.find(function(item) {
			return item.id == id;
		});
		return service;
	}
	this.getServiceIds = function () {
		const services = this.getServices()[this.companyIdAsKey()];
		if (services) {
			return services.map(function(item) {
				return item.id;
			});
		} else return [];
	}
	this.setFilter = function (data) {
		filters = {}
		for (let key in data) {
			filters[key] = data[key];
		}
	}
	this.getFilters = function () {
		return filters;
	}
	this.removeFilters = function (filtersArr) {
		for (let filter of filtersArr) {
			delete filters[filter];
		}
	}
	this.hasPriorityCustomer = function () {
		return this.getCurrentQueue().priorityCustomer? true : false;
	}
	this.findNextCustomerToServe = function (staffMember) {
		let nextCustomerToServe = null;
		if (this.hasPriorityCustomer()) {
			nextCustomerToServe = this.getCurrentQueue().priorityCustomer;
		} else nextCustomerToServe = this.getCustomers().find( (customer) => staffMember.service_ids.indexOf(customer.services[0].id) != -1);
		return nextCustomerToServe;
	}
	this.staffMemberHasServices = function (data) {
		// check if staff member supports any services of current queue...
		let staffMember = data;
		let queue = this.getCurrentQueue();
		if (queue.serviceIds) {
			for (let serviceId of staffMember.service_ids) {
				if (queue.serviceIds.indexOf(serviceId) !== -1) {
					return true;
				}
			}
		}
		return false;
	}
	this.setBookingsOnStaff = (bookings, staff) => {
		return $setBookingsOnStaff(bookings, staff);
	}
	this.setEstimatedWaitTimes = () => {
		return $setEstimatedWaitTimes();
	}
	this.log = function () {
		return []
	}
}
ZooQueue.prototype.consoleLogC = function (msg, styles = "background: lightgoldenrodyellow; color: #333;") {
	return console.log(`%czooQ => logC: ${msg}`, styles);
}
ZooQueue.prototype.consoleLog = function (msg1 = "", msg2 = "") {
	return console.log("%czooQ => log:", "color: cornflowerblue", msg1, msg2);
};
ZooQueue.prototype.consoleWarn = function (msg1 = "", msg2 = "") {
	return console.warn("%czooQ => warn:", "color: #333", msg1, msg2);
};
ZooQueue.prototype.consolePoll = function (msg1 = "", msg2 = "") {
	return console.log(`%czooQ => poll (${zooqueue.bookingbugApi__POLL_DELAY()/1000}s):`, "color: hotpink", msg1, msg2);
};
ZooQueue.prototype.consoleError = function (msg1 = "", msg2 = "") {
	setLoaded();
	return console.log("%czooQ => error:", "color: tomato", msg1, msg2);
};
ZooQueue.prototype.pusherLog = function (msg1 = "", msg2 = "") {
	return console.log("%cPusher => log:", "color: limegreen", msg1, msg2);
}
ZooQueue.prototype.elements = function (name) {
	const doc = (selectors) => {
		return document.querySelector(selectors);
	};
	const els = {
		alert: doc("alert"),
		alertMessage: doc("#alertMessage"),
		loader: doc("loader"),
		superContainer: doc("#superContainer"),
		navBar: doc("#navBar"),
		navBarInfoQueue: doc("#navBarInfoQueue"),
		navBarInfoQueueName: doc("#navBarInfoQueueName"),
		navBarInfoQueueCount: doc("#navBarInfoQueueCount"),
		navBarInfoServices: doc("#navBarInfoServices"),
		navBarInfoDatetime: doc("#navBarInfoDatetime"),
		navBarCtrl__queueSwitch: doc("#navBarCtrl__queueSwitch"),
		navBarCtrl__customerCreate: doc("#navBarCtrl__customerCreate"),
		navBarCtrl__queueCreate: doc("#navBarCtrl__queueCreate"),
		customerCreateForm: doc("#customerCreateForm"),
		customerCreateForm__serviceSelect: doc("#customerCreateForm__serviceSelect"),
		customerCreateForm__submitCtrl: doc("#customerCreateForm__submitCtrl"),
		queueSwitchForm: doc("#queueSwitchForm"),
		queueCreateForm: doc("#queueCreateForm"),
		queueCreateForm__serviceCheckboxItems: doc("#queueCreateForm__serviceCheckboxItems"),
		queueCreateForm__submitCtrl: doc("#queueCreateForm__submitCtrl"),
		switchColumnsCtrl: doc("#switchColumnsCtrl"),
		contentColumns: doc("#contentColumns"),
		staffCards: doc("#staffCards"),
		queueCards: doc("#queueCards"),
		staffCustomerFilterInfo: doc("#staffCustomerFilterInfo")
	};
	return els[name];
};
ZooQueue.prototype.getWaitTimeMinutes = function (startDate, nowDate = luxon.DateTime.local()) {
	const interval = luxon.Interval.fromDateTimes(startDate, nowDate);
	return interval.length("minutes");
};

// init...
const zooqueue = new ZooQueue();
window.zooqueue = zooqueue;
