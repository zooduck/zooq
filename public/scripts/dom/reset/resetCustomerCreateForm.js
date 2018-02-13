function resetCustomerCreateForm() {
  // ========================================
  // CUSTOMER: CREATE FORM SERVICE OPTIONS
  // ========================================
  Array.from(zooqueue.elements("customerCreateForm__serviceSelect").children).forEach( (item, index, arr) => {
    // if (index > 0) {
      item.parentNode.removeChild(item);
    // }
  });
}
