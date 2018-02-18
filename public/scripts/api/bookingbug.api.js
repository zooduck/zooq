// =================================
// BOOKINGBUG REQUEST HEADERS
// =================================
let requestHeaders = [
	["Content-Type", "application/json"],
	["App-Id", "f6b16c23"],
	["App-Key", "f0bc4f65f4fbfe7b4b3b7264b655f5eb"]
];
const loginDetails = {
	email: "wesley@bookingbug.com",
	password: "wesdxc23"
}
// =================================
// BOOKINGBUG LOGIN
// =================================
const bookingbugLogin = () => {
	const endpoint = "https://starfox.bookingbug.com/api/v1/login/admin";
	const formData = loginDetails;
	return $http("POST", endpoint, JSON.stringify(formData), requestHeaders);
};
const loginComplete = () => {
	return new Promise((resolve, reject) => {
			bookingbugLogin().then((json) => {
			const data = JSON.parse(json);
			const authToken = data["auth_token"];
			localStorage.clear();
			localStorage.setItem("auth-token", authToken);
			resolve(authToken);
		}, (err) => {
			reject(err);
		});
	})
};
// =================================
// BOOKINGBUG SERVICES GET ALL
// =================================
const bookingbugServices_GET = (authToken) => {
	// const endpoint = `https://starfox.bookingbug.com/api/v1/admin/${zooq.companyId()}/services`;
	const endpoint = `${zooq.bookingbugApiUrl__ADMIN()}${zooq.companyId()}/services`;
	requestHeaders[3] = ["auth-token", authToken];
	return $http("GET", endpoint, null, requestHeaders);
};
// =================================
// BOOKINGBUG PEOPLE GET ALL
// =================================
const bookingbugPeople_GET = (authToken) => {
	// const endpoint = `https://starfox.bookingbug.com/api/v1/admin/${zooq.companyId()}/people?embed=immediate_schedule`;
	const endpoint = `${zooq.bookingbugApiUrl__ADMIN()}${zooq.companyId()}/people`;
	requestHeaders[3] = ["auth-token", authToken];
	return $http("GET", endpoint, null, requestHeaders);
};
// =================================
// BOOKINGBUG BOOKINGS GET ALL
// (All bookings for today)
// =================================
const bookingbugBookings_GET = () => {
	const authToken = localStorage.getItem("auth-token");
	const start_date = luxon.DateTime.local().toSQLDate();
	const end_date = start_date;
	const company_id = zooq.companyId();
	const endpoint = `${zooq.bookingbugApiUrl__ADMIN()}${company_id}/bookings?start_date=${start_date}&end_date=${end_date}&per_page=1024&include_cancelled=false`;

	requestHeaders[3] = ["auth-token", authToken];

	return $http("GET", endpoint, null, requestHeaders);
};
// =================================
// BOOKINGBUG ADD CLIENT
// =================================
const bookingbugAddClient_POST = (data) => {
	const authToken = localStorage.getItem("auth-token");
	const company_id = data.default_company_id;
 	// const endpoint = `https://starfox.bookingbug.com/api/v1/admin/${company_id}/client`;
	const endpoint = `${zooq.bookingbugApiUrl__ADMIN()}${company_id}/client`;

	requestHeaders[3] = ["auth-token", authToken];

	return $http("POST", endpoint, JSON.stringify(data), requestHeaders);
}
// =================================
// BOOKINGBUG ADD BASKET ITEM
// =================================
const bookingbugAddItem_POST = (data) => {
	// ==========================================================================================
	// NOTE: I have to get the auth-token by logging into starfox.studio and creating a booking
	// (the auth-token that I get when logging in via this application is no good)
	// ==========================================================================================
	const authToken = zooq.queryStringService().get("auth-token");
	const company_id = data.items[0].company_id;
	// const endpoint = `https://starfox.bookingbug.com/api/v1/${company_id}/basket/checkout`;
	const endpoint = `${zooq.bookingbugApiUrl__PUBLIC()}${company_id}/basket/checkout`;

	requestHeaders[3] = ["auth-token", authToken];

	return $http("POST", endpoint, JSON.stringify(data), requestHeaders);
}
// =================================
// BOOKINGBUG CANCEL BOOKING
// =================================
const bookingbugCancelBooking_POST = (booking) => {
	// =================================================================================
	// NOTE: I have to get this by logging into starfox.studio and creating a booking
	// (the auth-token that I get when logging in via this application is no good)
	// =================================================================================
	const authToken = zooq.queryStringService().get("auth-token");
	// const endpoint = `https://starfox.bookingbug.com/api/v1/admin/${booking.company_id}/bookings/${booking.id}/cancel?notify=false`;
	const endpoint = `${zooq.bookingbugApiUrl__ADMIN()}${booking.company_id}/bookings/${booking.id}/cancel?notify=false`;

	requestHeaders[3] = ["auth-token", authToken];

	return $http("POST", endpoint, null, requestHeaders);
}
// ================================================================================
// NOTE: MULTI API METHOD (BOOKINGBUG AND ZOOQUEUE COMBINED!)
// call bookingbug bookings api and update zooqueue staff database as required
// ================================================================================
const bookingbugBookingsApi = () => {
	return new Promise( (resolve, reject) => {
		bookingbugBookings_GET().then( (result) => {
			if (result == "") {
				return resolve({info: "bookingbugBookings_GET(): NO_DATA"});
			}
			const data = JSON.parse(result);
			if (data.error) {
				zooq.consoleError(data.error);
				return reject(data.error);
			}
			const bookings = data._embedded.bookings;
			const staff = zooq.getStaff()[zooq.companyIdAsKey()];

			zooq.consoleLog("bookings from bookingbug api:", bookings);

			const staffBookingsUnchanged = zooq.setBookingsOnStaff(bookings, staff);

			if (!staffBookingsUnchanged) {
				// ======================================================
				// AT LEAST ONE BOOKING CHANGED, UPDATE STAFF DATABASE
				// ======================================================
				console.warn("NEW BOOKINGS FOUND FOR ONE OR MORE STAFF MEMBERS!");
				const staff = zooq.getStaff()[zooq.companyIdAsKey()];
				zooqApi().staffSetBookings(JSON.stringify(staff)).then( (result) => {
					return resolve(result);
				}, err => {
					zooq.consoleError(err);
					return reject(err);
				});
			} else return resolve({info: "New or expired bookings found for one or more staff members: false"});
		}, err => {
			zooq.consoleError(err);
			reject(err);
		});
	});
};
// =========================================================================
// CALL BOOKINGBUG SERVICE AND PEOPLE APIS AND UPDATE ZOOQUEUE DATABASE
// =========================================================================
let lastBookingbugServices = null;
let lastBookingbugPeople = null;
let customLogStyles = "background: lightgoldenrodyellow; color: #333;";
const bookingbugApis = () => {
	return new Promise( (resolve, reject) => {
			zooqApi().connectionTest().then( () => {
				let authToken = localStorage.getItem("auth-token");
				const promises = [bookingbugServices_GET(authToken), bookingbugPeople_GET(authToken)];
				let promisesToResolve = new Array(2);
				Promise.all(promises).then( (results) => {
					let services = results[0];
					let people = results[1];
					const resolveData = {
						services: services,
						people: people
					}
					const servicesChanged = !_.isEqual(services, lastBookingbugServices);
					const peopleChanged = !_.isEqual(people, lastBookingbugPeople);

					if (!servicesChanged && !peopleChanged) {
						resolve({info: `peopleChanged (in bookingbug): ${peopleChanged}, servicesChanged (in bookingbug): ${servicesChanged}`});
					}
					if (servicesChanged && !peopleChanged || peopleChanged && !servicesChanged) {
						promisesToResolve.pop();
					}

					if (servicesChanged) {
						zooq.consoleLogC(`services CHANGED`, customLogStyles);
						// ==============================
						// UPDATE SERVICES DATABASE
						// ==============================
						const data = JSON.parse(services)._embedded.services;
						zooqApi().servicesSet(JSON.stringify(data)).then( (result) => {
							lastBookingbugServices = services;
							promisesToResolve.pop();
							if (promisesToResolve.length == 0) {
								resolve(resolveData);
							}
						}, err => {
							zooq.consoleError(err);
						});
					}
					if (peopleChanged) {
						zooq.consoleLogC(`people CHANGED`, customLogStyles);
						// ============================
						// UPDATE STAFF DATABASE
						// ============================
						const data = JSON.parse(people)._embedded.people;
						zooqApi().staffSet(JSON.stringify(data)).then( (result) => {
							lastBookingbugPeople = people;
							promisesToResolve.pop();
							if (promisesToResolve.length == 0) {
								resolve(resolveData);
							}
						});
					}
				}, err => {
					zooq.consoleError(err);
					reject(err);
				});
			}, err => {
				zooq.consoleError(err.error.info);
				reject(err);
			});
	});
};
