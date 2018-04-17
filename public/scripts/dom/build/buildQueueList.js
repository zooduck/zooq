function buildQueueList() {
  // ======================================
  // QUEUE LIST: BUILD QUEUE LIST LINKS
  // ======================================
  resetQueueList();
  let queues = zooq.getQueues()[zooq.companyIdAsKey()];
  for (let queue of queues) {
    addQueueListItemToDOM(queue);
  }  
}
