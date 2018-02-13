function resetStaffCards () {
  // ===============================
  // STAFF CARDS: CLEAR ITEMS
  // ===============================
  const staffCards = zooqueue.elements("staffCards");
  for (let card of Array.from(staffCards.children)) {
    if (!card.hasAttribute("template") && !card.hasAttribute("static")) {
      card.parentNode.removeChild(card);
    }
  }
}
