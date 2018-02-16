// ==========================================================
// EVENT: SET FREE (RETURN FROM BUSY (OTHER) OR ON BREAK)
// ==========================================================
const setFreeCtrl__EVENT = (el) => {
  const staffMemberId = el.getAttribute("staff-id");
  zooqueueApi().staffMemberSetFree(staffMemberId).then( (result) => {
    zooq.consoleLog(result);
  }, err => {
    zooq.consoleError(err);  
  });
};
