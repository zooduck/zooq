function resetQueueList () {
  // ===========================
  // QUEUE LIST CLEAR ITEMS
  // ===========================
  Array.from(zooqueue.elements("queueSwitchForm").children).forEach( (item, index, arr) => {
    if (index > 0) {
      item.parentNode.removeChild(item);
    }
  });
}
