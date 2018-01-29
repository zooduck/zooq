String.prototype.toSnakeCase = function () {
	return this.replace(/\s/g, "_");
};
