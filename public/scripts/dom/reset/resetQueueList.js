function resetQueueList () {
  // ===========================
  // QUEUE LIST CLEAR ITEMS
  // ===========================
  Array.from(zooq.elements("queueSwitchForm").children).forEach( (item, index, arr) => {
    if (index > 0) {
      item.parentNode.removeChild(item);
    }
  });
}
