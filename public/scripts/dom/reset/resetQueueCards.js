function resetQueueCards () {
  // =============================
  // QUEUE CARDS: CLEAR ITEMS
  // =============================
  const queueCards = zooq.elements("queueCards");
  for (let card of Array.from(queueCards.children)) {
    if (!card.hasAttribute("template") && !card.hasAttribute("static")) {
      card.parentNode.removeChild(card);
    }
  }
  zooq.consoleLog("resetCards: completed");
}
