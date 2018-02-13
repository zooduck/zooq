function resetQueueCards () {
  // =============================
  // QUEUE CARDS: CLEAR ITEMS
  // =============================
  const queueCards = zooqueue.elements("queueCards");
  for (let card of Array.from(queueCards.children)) {
    if (!card.hasAttribute("template") && !card.hasAttribute("static")) {
      card.parentNode.removeChild(card);
    }
  }
  zooqueue.consoleLog("resetCards: completed");
}
