const { alias } = require("react-app-rewire-alias");

module.exports = function override(config) {
	alias({
		"@admin/langModel": "../admin/langModel",
	})(config);

	return config;
};
