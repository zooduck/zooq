const endShiftCtrl__EVENT = (el) => {
  const staffMemberId = el.getAttribute("staff-id");
  zooqApi().staffMemberEndShift(staffMemberId).then( (result) => {
    const staffMember = result;
    const shiftStartDate = luxon.DateTime.fromISO(staffMember.attendance_started);
    const shiftEndDate = luxon.DateTime.fromISO(staffMember.attendance_ended);
    const shiftDuration = luxon.Interval.fromDateTimes(shiftStartDate, shiftEndDate).length("minutes").toTimeString();
    zooq.consoleLogC(`${staffMember.name}'s shift ended with a total duration of: ${shiftDuration}`);
  }, err => {
    zooq.consoleError(err);
  });
}
