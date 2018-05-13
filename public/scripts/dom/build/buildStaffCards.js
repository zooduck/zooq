function buildStaffCards(filters) {
  resetStaffCards();
  // ===========================
  // STAFF CARDS: BUILD ITEMS
  // ===========================
  const staff = zooq.getStaff()[zooq.companyIdAsKey()];
  const filteredStaff = staff.filter( (item) => item.service_ids)
  const staffBusy = [];
  const staffFree = [];
  const staffAway = [];
  for (let staffMember of staff) {
    // =============================================================================
    // NOTE: STAFF MEMBER MUST SUPPORT AT LEAST ONE SERVICE IN THE CURRENT QUEUE
    // =============================================================================

    // == log =================================================
    zooq.consoleLog({
      name: staffMember.name,
      hasServices: zooq.staffMemberHasServices(staffMember),
      queuing_disabled: staffMember.queuing_disabled
    });
    // == \log ================================================

    if (zooq.staffMemberHasServices(staffMember) && !staffMember.queuing_disabled) {
      staffMember.attendance_status == 0? staffAway.push(staffMember) : staffMember.attendance_status == 1? staffFree.push(staffMember) : staffBusy.push(staffMember);
      // staffMember.attendance_started && staffMember.attendance_status != 1? staffBusy.push(staffMember) : staffFree.push(staffMember);
    }
  }

  // == log =========================================================================
  zooq.consoleLog(staff.map( (staffMember) => {
    if (zooq.staffMemberHasServices(staffMember) && !staffMember.queuing_disabled) {
      return staffMember.name;
    }
  }).join(', ').replace(/,\s(?![^,])+/g, ""), "have services in this queue");
  // == \log ========================================================================

  staffBusy.sort( (a, b) => {
    // console.log(a.appointmentTimeLeft, b.appointmentTimeLeft);
    return a.appointmentTimeLeft - b.appointmentTimeLeft;
    //return luxon.DateTime.fromISO(b.attendance_started) - luxon.DateTime.fromISO(a.attendance_started);
  });
  const shuffledStaff = staffFree.concat(staffBusy).concat(staffAway);
  for (const staffMember of shuffledStaff) {
    if ((!filters.staffMember || filters.staffMember.id == staffMember.id) && (!filters.customer || staffMember.service_ids.indexOf(filters.customer.services[0].id) != -1)) {
      addStaffCardToDOM(staffMember);
    }
  }
  zooq.consoleLog("buildStaffCards: completed");
}
