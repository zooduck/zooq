function resetQueueCreateForm() {
  // ========================================
  // QUEUE: CREATE FORM SERVICE CHECKBOXES
  // ========================================
  Array.from(zooq.elements("queueCreateForm__serviceCheckboxItems").children).forEach( (item, index, arr) => {
    if (index > 0) {
      item.parentNode.removeChild(item);
    }
  });
}
