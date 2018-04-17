const zooqDOM = (function zooqDOM() {
  return function () {
    return {
      addCustomerToQueue(id) {
        const customer = zooq.getCustomer(id);
        const options = { animate: true, buildType: "CREATE" }
        addQueueCardToDOM(customer, options);
      },
      deleteCustomerFromQueue(id) {
        deleteQueueCardFromDOM(id);
      },
      updateQueueCard(customer) {
        updateQueueCardInDOM(customer);
      },
      updateStaffCard(staffMember, reorderItemsByAttendanceStatus = true) {
        updateStaffCardInDOM(staffMember, reorderItemsByAttendanceStatus)
      },
      buildQueueList() {
        buildQueueList();
      },
      setQueueTitle() {
        setQueueTitleInDOM();
      }
    }
  }
})();
