// ===============================
// LOADER
// ===============================
const setLoading = () => {
	zooq.elements("loader").classList.add("--active");
};
const setLoaded = (minimumDisplayTime = 0) => {
	setTimeout( () => {
		zooq.elements("loader").classList.remove("--active");
	}, minimumDisplayTime);
	zooq.elements("loader").classList.remove("--active");
};
