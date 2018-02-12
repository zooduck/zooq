const deleteQueueCardFromDOM = (id) => {
	const qCard = document.getElementById(id);
	const oh = qCard.offsetHeight;
	qCard.style.height = `${oh}px`;
	qCard.style.opacity = 0;
	setTimeout( () => {
		qCard.style.transition = "all .5s";
		qCard.style.height = 0;
		qCard.style.marginTop = 0;
		qCard.style.borderWidth = 0;
		qCard.style.padding = 0;
	}, 50);
	setTimeout( () => {
		qCard.parentNode.removeChild(qCard);
	}, 550);
}
