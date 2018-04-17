const updateStaffCardInDOM = (staffMember, reorderItemsByAttendanceStatus = true) => {
  staffCardBuild(staffMember, "UPDATE", reorderItemsByAttendanceStatus);
};
