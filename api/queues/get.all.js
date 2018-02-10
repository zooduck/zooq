// methods...
const queuesGetAll = (function queuesGetAll () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
    return new Promise( (resolve, reject) => {
      payload.dbo.collection("q").find({}).sort({createdAt: 1}).toArray( (err, result) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        const queues = {}
        queues[companyIdAsKey] = result;
        return resolve(JSON.stringify(queues));
      });
    }); // end Promise
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
module.exports = queuesGetAll;
