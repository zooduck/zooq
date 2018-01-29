// dependencies...
const fs = require("fs");
// methods...
const customersDeleteOne = (function customersDeleteOne () {
	const $run = (payload) => {
    // ====================================================================================
    // DELETE customer
    // OBJECTIVE: find the customer in the specified queue and delete them from the queue
    // ====================================================================================
    const companyIdAsKey = `_${payload.params.companyId}`;
    const payloadQueueId = payload.params.queueId;
    const payloadCustomerId = payload.id;
    const db = "./db/q.db.json";

    return new Promise( (resolve, reject) => {
      // read db (queues)...
      fs.readFile(db, "utf8", (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        if (data && data != "") {
          let allQueues = JSON.parse(data);
          let queues = allQueues[companyIdAsKey];
          let currentQueue = queues.find( (item) => {
            return item.id == payloadQueueId;
          });
          if (currentQueue) {
            let customerIndex = currentQueue.customers.findIndex( (item) => {
              return item.id == payloadCustomerId;
            });
            currentQueue.customers.splice(customerIndex, 1);
          } else reject(JSON.stringify({error: `PUT to api/customers/${payloadCustomerId}/ failed`}));
          // write db (queues)...
          fs.writeFile(db, JSON.stringify(allQueues), "utf8", (err) => {
            if (err) {
              console.log(err);
              reject(err);
            }
            resolve(JSON.stringify(allQueues)); // all queues for all child companies
          });
        } else {
          let dbObj = {};
          dbObj[companyIdAsKey] = [];
          resolve(JSON.stringify(dbObj));
          console.log("DATABASE q.db.json IS EMPTY");
        }
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
module.exports = customersDeleteOne;
