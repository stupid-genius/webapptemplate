const model = require('../models/index.js');

module.exports = {
	async up () {
		console.dir(model);
	},
	async down () {
		console.dir(model);
	}
};
