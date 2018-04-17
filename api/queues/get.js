// methods...
const queuesGetOne = (function queuesGetOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
		const queueId = payload.id;
		return new Promie( (resolve, reject) => {
			payload.dbo.collection("q").findOne({id: queueId}, (err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				} else return resolve(JSON.stringify(result));
			});
		});
	}
	return function () {
		return {
			run: (payload = { data: {}, params: [], id: "" }) => {
				return $run(payload);
			}
		}
	}
})();
// exports...
module.exports = queuesGetOne;
