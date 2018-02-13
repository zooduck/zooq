function buildQueueList() {
  // ======================================
  // QUEUE LIST: BUILD QUEUE LIST LINKS
  // ======================================
  resetQueueList();
  let queues = zooqueue.getQueues()[zooqueue.companyIdAsKey()];
  for (let queue of queues) {
    addQueueListItemToDOM(queue);
  }  
}
