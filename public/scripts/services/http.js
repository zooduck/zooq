const $http = (type, url, formData=null, requestHeaders = []) => {
	const promise = new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.onerror = function (err) {
			const errors = [ "ERR_CONNECTION_REFUSED", "ERR_NAME_NOT_RESOLVED", "ERR_BLOCKED_BY_CLIENT", "ERR_TUNNEL_CONNECTION_FAILED"];
			const errorInfo = `The connection failed with one of the following errors: ${errors.join("|")}`;
			const errObj = {
				error: {
					info: errorInfo
				},
				info: "Could not determine the type of error. Please check the data property of this object for a list of possible errors",
				data: errors
			};
			reject(errObj);
		}
		xhr.open(type, url);
		for (let header of requestHeaders) {
			let key = header[0];
			let val = header[1];
			xhr.setRequestHeader(key, val);
		}
		xhr.send(formData);
		xhr.onload = () => {
			resolve(xhr.responseText);
		}
	});
	return promise;
};
