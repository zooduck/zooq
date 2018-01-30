// ============================
// METHOD: addStaffCardToDOM
// ============================
const addStaffCardToDOM = (staffMember) => {
	const staffCards = zooqueue.elements("staffCards");
	const template = staffCards.querySelector("[template]");
	const sCard = template.cloneNode(true);

	sCard.removeAttribute("template");
	sCard.setAttribute("id", staffMember.id);

	const customLogStyles = "background: lightgoldenrodyellow; color: #333;";

	const avatar__el = sCard.querySelector("[avatar]");
	const staffMemberName__el = sCard.querySelector("[staff-member-name]");
	const serviceNames__el = sCard.querySelector("[service-names]");
	const staffMemberStatus__el = sCard.querySelector("[staff-member-status]");
	const appointmentInfo__el = sCard.querySelector(".staff-card__row__appointment-info");
	const appointmentInfoService__el = sCard.querySelector("[appointment-info-service]");
	const appointmentInfoTime__el = sCard.querySelector("[appointment-info-time]");
	const appointmentInfoServing__el = sCard.querySelector("[appointment-info-serving]");
	const appointmentInfoDuration__el = sCard.querySelector("[appointment-info-duration]");
	const nextAppointmentInfo__el = sCard.querySelector("[next-appointment-info]");

	// ===============
	// CTRL BUTTONS
	// ===============
	const setOnBreakCtrl__button = sCard.querySelector("[set-on-break-ctrl]");
	setOnBreakCtrl__button.setAttribute("staff-id", staffMember.id);
	setOnBreakCtrl__button.parentNode.setAttribute("hidden", "hidden");

	const setBusyCtrl__button = sCard.querySelector("[set-busy-ctrl]");
	setBusyCtrl__button.setAttribute("staff-id", staffMember.id);
	setBusyCtrl__button.parentNode.setAttribute("hidden", "hidden");

	const setFreeCtrl__button = sCard.querySelector("[set-free-ctrl]");
	setFreeCtrl__button.setAttribute("staff-id", staffMember.id);
	setFreeCtrl__button.parentNode.setAttribute("hidden", "hidden");

	const serveNextCtrl__button = sCard.querySelector("[serve-next-ctrl]");
	serveNextCtrl__button.setAttribute("staff-id", staffMember.id);
	serveNextCtrl__button.parentNode.setAttribute("hidden", "hidden");
	if (zooqueue.hasPriorityCustomer()) {
		const priorityCustomer = zooqueue.getCurrentQueue().priorityCustomer;
		serveNextCtrl__button.innerHTML = `Serve ${priorityCustomer.firstName} ${priorityCustomer.lastName}`;
	}

	const finishServingCtrl__button = sCard.querySelector("[finish-serving-ctrl");
	finishServingCtrl__button.setAttribute("staff-id", staffMember.id);
	finishServingCtrl__button.parentNode.setAttribute("hidden", "hidden");

	const startShiftCtrl__button = sCard.querySelector("[start-shift-ctrl]");
	startShiftCtrl__button.setAttribute("staff-id", staffMember.id);
	startShiftCtrl__button.parentNode.setAttribute("hidden", "hidden");

	const endShiftCtrl__button = sCard.querySelector("[end-shift-ctrl]");
	endShiftCtrl__button.setAttribute("staff-id", staffMember.id);
	endShiftCtrl__button.parentNode.setAttribute("hidden", "hidden");

	const ctrlAttrsByAttendanceStatus = {
		0: [startShiftCtrl__button],
		1: [endShiftCtrl__button, serveNextCtrl__button, setOnBreakCtrl__button, setBusyCtrl__button],
		2: [setFreeCtrl__button],
		3: [setFreeCtrl__button],
		4: [finishServingCtrl__button],
		5: [] // active calendar booking
	};

	// =====================================================
	// hide / show ctrl buttons based on attendance_status
	// =================================================================================================================================================
	// NOTE: It is possible for staff to have an active booking in the calendar and an attendance_status code of anything other than 4 (even 0)
	// but we should regard bookings in the calendar as real and happening, and for that reason I assign calendar bookings in progress to the
	// "activeBooking" prop of the staffMember, and in that case we want to show the same styles and ctrl set as for attendance_status 4 (busy serving)
	// ==================================================================================================================================================
	let statusKey = staffMember.activeBooking && (staffMember.activeBookingType == "CALENDAR" || staffMember.attendance_status != 4)? 5 : staffMember.attendance_status;
	for (ctrl of ctrlAttrsByAttendanceStatus[statusKey]) {
		ctrl.parentNode.removeAttribute("hidden");
	}

	// ======================
	// CTRL BUTTON EVENTS
	// =====================
	if (staffMember.attendance_status == 0) {
		// ====================
		// EVENT: START SHIFT
		// ====================
		startShiftCtrl__button.addEventListener("click", function (e) {
			setLoading();
			startShiftCtrl__EVENT(this);
		});
	} else if (staffMember.attendance_status == 1) {
		// ====================
		// EVENT: SET BUSY
		// ====================
		setBusyCtrl__button.addEventListener("click", function (e) {
			setLoading();
			setBusyCtrl__EVENT(this);
		});
		// ====================
		// EVENT: SET ON BREAK
		// ====================
		setOnBreakCtrl__button.addEventListener("click", function (e) {
			setLoading();
			setOnBreakCtrl__EVENT(this);
		});
		// ====================
		// EVENT: SERVE NEXT
		// ====================
		serveNextCtrl__button.addEventListener("click", function (e) {
			setLoading();
			if (zooqueue.hasPriorityCustomer()) {
				serveNextCtrl__EVENT(this, zooqueue.getCurrentQueue().priorityCustomer);
			} else serveNextCtrl__EVENT(this);
		});
		// ====================
		// EVENT: END SHIFT
		// ====================
		endShiftCtrl__button.addEventListener("click", function (e) {
			setLoading();
			endShiftCtrl__EVENT(this);
		});
	} else if (staffMember.attendance_status == 2 || staffMember.attendance_status == 3) {
		setFreeCtrl__button.addEventListener("click", function (e) {
			setLoading();
			setFreeCtrl__EVENT(this);
		});
	} else if (staffMember.attendance_status == 4) {
		finishServingCtrl__button.addEventListener("click", function (e) {
			setLoading();
			finishServingCtrl__EVENT(this);
		});
	}
	// =======================================================================================================
	// EVENT: FILTER LIST BY STAFF MEMBER (show only customers with services supported by this staff member)
	// =======================================================================================================
	avatar__el.addEventListener("click", function (e) {
		filterCustomersByStaffMemberServicesCtrl__EVENT(this);
	}); // close addEventListener


	// ========================
	// UNIVERSAL CARD VALUES
	// ========================
	const avatarUrl = `https://api.adorable.io/avatars/44/${staffMember.id}.png`;
	avatar__el.style.backgroundImage = `url(${avatarUrl})`;
	staffMemberName__el.innerHTML = staffMember.name;
	const servicesWithQueuingEnabled = zooqueue.getServiceIds();
	const validServiceIds = staffMember.service_ids.filter(function(item) {
		return servicesWithQueuingEnabled.indexOf(item) !== -1;
	});
	const validServiceNames = [];
	for (serviceId of validServiceIds) {
		validServiceNames.push(`${zooqueue.getService(serviceId).name} (${zooqueue.getService(serviceId).durations[0]}m)`);
	}
	serviceNames__el.innerHTML = validServiceNames.join(" | ");

	// ================================
	// INFO: ATTENDANCE_STATUS LEGEND
	// ================================
	// 0: AWOL (AWAY)
	// 1: AVAILABLE
	// 2: ON BREAK
	// 3: BUSY (OTHER)
	// 4: BUSY (IN APPOINTMENT)
	// ===========================

	// =========================================
	// ATTENDANCE_STATUS SPECIFIC CARD VALUES
	// =========================================
	if (staffMember.activeBooking) {
		// ================================
		// STAFF MEMBER IS BUSY SERVING
		// =================================
		const startDate = luxon.DateTime.fromISO(staffMember.activeBooking.datetime);
		const startDate__simple = startDate.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
		// --------------------------------------------------------------------------------------
		// NOTE: the booking.datetime might be earlier than the time at which the customer is
		// actually served (this is due to minimum timestep of 5 minutes in calendar)
		// ---------------------------------------------------------------------------------------
		const interval = luxon.Interval.fromDateTimes(startDate, luxon.DateTime.local());
		const durationString = interval.length("minutes").toTimeString();

		if (staffMember.activeBookingType == "QUEUE") {
			// ===========================================================================================================
			// NOTE: ALTHOUGH WE HAVE BOOKING DETAILS IN "activeBooking" WE STILL USE OUR OWN "serving" PROP
			// TO GET INFO ABOUT THE CURRENT QUEUE APPOINTMENT AS IT CONTAINS ADDITIONAL INFO SUCH AS ticketRef
			// ===========================================================================================================
			zooqueue.consoleLogC(`${staffMember.name} is BUSY because they have an activeBooking with an activeBookingType of "${staffMember.activeBookingType}"`, customLogStyles);
			appointmentInfo__el.classList.add("--active");
			// ========================================
			// BOOKING WAS MADE BY THIS APPLICATION
			// ========================================
			const serviceDuration = staffMember.serving[0].service.durations[0];
			const endDate = startDate.plus({minutes: staffMember.serving[0].service.durations[0]});
			const endDate__simple = endDate.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);

			const appointmentInterval = luxon.Interval.fromDateTimes(startDate, endDate);
			const appointmentInterval__minutes = appointmentInterval.length("minutes").toTimeString();

			appointmentInfoServing__el.innerHTML = `${staffMember.serving[0].firstName || ""} ${staffMember.serving[0].lastName || ""}`;
			if (staffMember.serving[0].ticketRef) {
				appointmentInfoServing__el.innerHTML += ` (TICKET: ${staffMember.serving[0].ticketRef})`;
			}
			appointmentInfoService__el.innerHTML = staffMember.serving[0].service.name;
			appointmentInfoTime__el.innerHTML = `${startDate__simple} - ${endDate__simple} (${appointmentInterval__minutes})`;
			appointmentInfoDuration__el.innerHTML = durationString;

		} else if (staffMember.activeBookingType == "CALENDAR") {
			zooqueue.consoleLogC(`${staffMember.name} is BUSY because they have an activeBooking with an activeBookingType of "${staffMember.activeBookingType}"`, customLogStyles);
			appointmentInfo__el.classList.add("--active");
			// ====================================================
			// CURRENT BOOKING WAS MADE USING BOOKINGBUG CALENDAR
			// ====================================================
			const booking = staffMember.activeBooking;
			const startDate = luxon.DateTime.fromISO(booking.datetime);
			const startDate__simple = startDate.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
			const endDate = luxon.DateTime.fromISO(booking.end_datetime);
			const endDate__simple = endDate.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
			const appointmentInterval = luxon.Interval.fromDateTimes(startDate, endDate);

			appointmentInfoServing__el.innerHTML = `${booking.client_name} (NOT FROM QUEUE)`;
			appointmentInfoService__el.innerHTML = booking.service_name;
			appointmentInfoTime__el.innerHTML = `${startDate__simple} - ${endDate__simple} (${appointmentInterval.length("minutes").toTimeString()})`;
			appointmentInfoDuration__el.innerHTML = durationString;

		}
	} else if (staffMember.attendance_status == 2 && staffMember.activeBreak) {
		zooqueue.consoleLogC(`${staffMember.name} is BUSY because they have an activeBreak`, customLogStyles);
		appointmentInfo__el.classList.add("--active");
		const startDate = luxon.DateTime.fromISO(staffMember.activeBreak.datetime);
		const startDate__simple = startDate.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
		const endDate__simple = luxon.DateTime.fromISO(staffMember.activeBreak.endDatetime).toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
		const duration = staffMember.activeBreak.duration;
		const interval = luxon.Interval.fromDateTimes(startDate, luxon.DateTime.local());
		const timePassedString = interval.length("minutes").toTimeString();
		appointmentInfoTime__el.innerHTML = `${startDate__simple} - ${endDate__simple} (${duration.toTimeString()})`;
		appointmentInfoDuration__el.innerHTML = timePassedString;

	} else if (staffMember.attendance_status == 3 && staffMember.activeBusy) {
		zooqueue.consoleLogC(`${staffMember.name} is BUSY because they have an activeBusy`, customLogStyles);
		appointmentInfo__el.classList.add("--active");
		const startDate = luxon.DateTime.fromISO(staffMember.activeBusy.datetime);
		const startDate__simple = startDate.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
		const endDate__simple = luxon.DateTime.fromISO(staffMember.activeBusy.endDatetime).toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
		const duration = staffMember.activeBusy.duration;
		const interval = luxon.Interval.fromDateTimes(startDate, luxon.DateTime.local());
		const timePassedString = interval.length("minutes").toTimeString();
		appointmentInfoTime__el.innerHTML = `${startDate__simple} - ${endDate__simple} (${duration.toTimeString()})`;
		appointmentInfoDuration__el.innerHTML = timePassedString;
	}

	if (staffMember.nextBooking) {
		console.log(`${staffMember.name} has an upcoming booking`);
		// ==================================================
		// STAFF MEMBER HAS AN UPCOMING BOOKING
		// ==================================================
		const clientName = staffMember.nextBooking.client_name;
		const time = luxon.DateTime.fromISO(staffMember.nextBooking.datetime).toLocaleString(luxon.DateTime.TIME_SIMPLE);
		const serviceName = staffMember.nextBooking.service_name;
		nextAppointmentInfo__el.innerHTML =  `${serviceName} with ${clientName} at ${time}`;
	}

	// ==============
	// CARD STYLES
	// ==============
	if (staffMember.attendance_status == 0) {
		// AWOL
		sCard.classList.add("awol");
		staffMemberStatus__el.innerHTML = "AWAY (WITH THE FAIRIES)";
		staffMemberStatus__el.classList.add("awol");
	}
	if (staffMember.attendance_status == 1) {
		// AVAILABLE
		sCard.classList.add("available");
		staffMemberStatus__el.innerHTML = "AVAILABLE";
		staffMemberStatus__el.classList.add("available");
	}
	if (staffMember.attendance_status == 2) {
		// ON BREAK
		sCard.classList.add("on-break");
		staffMemberStatus__el.innerHTML = "ON BREAK";
		staffMemberStatus__el.classList.add("on-break");
	}
	if (staffMember.attendance_status == 3) {
		// BUSY (OTHER)
		sCard.classList.add("busy");
		staffMemberStatus__el.innerHTML = "BUSY (OTHER)";
		staffMemberStatus__el.classList.add("busy");
	}
	if (staffMember.attendance_status == 4 || staffMember.activeBooking) {
		// BUSY SERVING
		sCard.classList.add("busy");
		staffMemberStatus__el.innerHTML = `BUSY SERVING (${staffMember.activeQueue? "from " + staffMember.activeQueue.name : "NOT FROM QUEUE"})`;
		staffMemberStatus__el.classList.add("busy");
		appointmentInfo__el.classList.add("--active");
	}

	staffCards.appendChild(sCard);
}
