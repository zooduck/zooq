const queueCardBuild = (customer, options = {animate: false, buildType: "CREATE"}) => {

	const queueCards = zooq.elements("queueCards");
	const template = queueCards.querySelector("[template]");

  let qCard;
  if (options.buildType == "UPDATE") {
    qCard = document.getElementById(customer.id);
  } else {
    qCard = template.cloneNode(true);
    qCard.removeAttribute("template");
  	qCard.setAttribute("id", customer.id);
  }

  if (!qCard) {
    return;
  }

	if (options.animate === true) {
		qCard.classList.add("zooq__animation__SLIDE_IN_FROM_RIGHT");
	}

	const priorityCustomer = zooq.hasPriorityCustomer() && zooq.getCurrentQueue().priorityCustomer.id == customer.id;

	const ticketRef__el = qCard.querySelector("[ticket-ref]");
	const customerName__el = qCard.querySelector("[customer-name]");
	const customerServiceInfo__el = qCard.querySelector("[customer-service-info]");
	const customerWaitTimeEstimateInfo__el = qCard.querySelector("[customer-wait-time-estimate-info]");
	const customerWaitTime__el = qCard.querySelector("[customer-wait-time]");
	const deleteCustomerCtrl__el = qCard.querySelector("[delete-customer-ctrl]");
	const setPriorityCustomerCtrl__el = qCard.querySelector("[set-priority-customer]");
	const unsetPriorityCustomerCtrl__el = qCard.querySelector("[unset-priority-customer]");

	// console.log("CUSTOMER =>", customer);

	const customerWaitTime = zooq.getWaitTimeMinutes(luxon.DateTime.fromISO(customer.queueStarted));
	const customerWaitTimeEstimate = customer.estimatedWaitTime.toTimeString();

	if (priorityCustomer) {
		qCard.classList.add("priority-customer");
		setPriorityCustomerCtrl__el.setAttribute("hidden", "hidden");
		unsetPriorityCustomerCtrl__el.removeAttribute("hidden");
	}

	ticketRef__el.innerHTML = customer.ticketRefDisplay || customer.ticketRef;
  if (customer.services[0].colour) {
    ticketRef__el.parentNode.style.backgroundColor = `#${customer.services[0].colour}`;
  }
	customerName__el.innerHTML = `${customer.firstName} ${customer.lastName}`;
	customerWaitTime__el.innerHTML = customerWaitTime.toTimeString();
	customerServiceInfo__el.innerHTML = `${customer.services[0].name} (${customer.services[0].durations[0].toTimeString()})`;

  if (customer.estimatedWaitTime == "FOREVER_AND_A_DAY") {
    customerWaitTimeEstimateInfo__el.innerHTML = "N/A";
  } else if (customer.estimatedWaitTime <= 0) {
 		customerWaitTimeEstimateInfo__el.innerHTML = `${customer.nextAvailableStaffMember.name} (OVERDUE)`;
		customerWaitTimeEstimateInfo__el.parentNode.classList.add("overdue");
 	} else customerWaitTimeEstimateInfo__el.innerHTML = `${customer.nextAvailableStaffMember.name} in approx. ${customerWaitTimeEstimate}`;

	// ====================
	// EVENT LISTENERS...
	// ====================

	// filter list by customer
	ticketRef__el.parentNode.onclick = function (e) {
		filterStaffByCustomerCtrl__EVENT(this);
	};

	// delete customer from queue
  deleteCustomerCtrl__el.setAttribute("customer-id", customer.id);
  deleteCustomerCtrl__el.onclick = function (e) {
    deleteCustomerFromQueueCtrl__EVENT(this);
	};

	// set priority customer
	setPriorityCustomerCtrl__el.setAttribute("customer-id", customer.id);
	setPriorityCustomerCtrl__el.onclick = function (e) {
		setPriorityCustomerCtrl__EVENT(this);
	};

	// unset priority customer
	unsetPriorityCustomerCtrl__el.onclick = function (e) {
		unsetPriorityCustomerCtrl__EVENT();
	};


  if (options.buildType == "CREATE") {
    queueCards.appendChild(qCard);
  }

};
