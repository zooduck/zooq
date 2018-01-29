// ===============================
// LOADER
// ===============================
const setLoading = () => {
	zooqueue.elements("loader").classList.add("--active");
};
const setLoaded = (minimumDisplayTime = 0) => {
	setTimeout( () => {
		zooqueue.elements("loader").classList.remove("--active");
	}, minimumDisplayTime);
	zooqueue.elements("loader").classList.remove("--active");
};
