Number.prototype.toTimeString = function () {
	// expects query to be minutes
	let hours = Math.floor(this / 60);
	let minutes = Math.round(this - (60 * hours));
	let timeString = "";
	timeString += hours > 0? `${hours}h` : "";
	timeString += minutes > 0 && hours == 0 || hours == 0 && minutes == 0? `${minutes}m` : minutes > 0 && hours > 0? ` ${minutes}m` : "";
	return timeString;
}
