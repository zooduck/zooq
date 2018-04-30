// dependencies...
const _ = require("lodash");
const luxon = require("luxon");
const pusherService = require("../pusher/pusher.service.js");
// methods...
const queuesCreateOne = (function queuesCreateOne () {
	const $run = (payload) => {
		const companyIdAsKey = `_${payload.params.companyId}`;
    let payloadQueue = JSON.parse(payload.data);
    let oldQueues = {}

		function genQCode (totalQueues, oldQueues) {
			const codesChecked = [];
			const codeKeys = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
			const code = codeKeys[totalQueues] + codeKeys.reverse()[totalQueues];
			const codeExists = oldQueues.find( (qItem) => {
				return qItem.code == code;
			});
			const codeAlreadyChecked = codesChecked.find( (code) => codesChecked.indexOf(code) !== -1);
			codesChecked.push(code);
			if (codeExists && !codeAlreadyChecked) {
				totalQueues += 1;
				return genQCode(totalQueues, oldQueues);
			} else return code;
		}

    return new Promise( (resolve, reject) => {
			payload.dbo.collection("q").find({}).toArray( (err, result) => {
				if (err) {
					console.log(err);
					return reject(err);
				}
				oldQueues[companyIdAsKey] = result;
				// ==================
				// set queue.code
				// ==================
				const totalQueues = result.length;
				const codeKeys = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
				// payloadQueue.code = codeKeys[totalQueues] + codeKeys.reverse()[totalQueues];
				const qCode = genQCode(totalQueues, oldQueues[companyIdAsKey]);
				payloadQueue.code = qCode;
				// ======================
				//  set queue.createdAt
				// ======================
				payloadQueue.createdAt = luxon.DateTime.local().toISO();
				// ====================
				//  INSERT QUEUE
				// ====================
				payload.dbo.collection("q").insertOne(payloadQueue, (err, result) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					payload.dbo.collection("q").find({}).sort({createdAt: 1}).toArray( (err, result) => {
						if (err) {
							console.log(err);
							return reject(err);
						}
						const queues = {}
						queues[companyIdAsKey] = result;
						if (!_.isEqual(queues, oldQueues)) {
							// push message to client...
							const data = {
								queue: {
									create: payloadQueue.id
								}
							}
							const type = "QUEUE__CREATE";
							pusherService().trigger(data, type);
						}
						return resolve(JSON.stringify(queues));
					});
				})
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
module.exports = queuesCreateOne;
