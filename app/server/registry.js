// const URL = require('url').URL;
const config = require('./config.js');

// const dbURL = new URL(config.dbURL);
const docsSpec = Object.freeze({
	protocol: config.docsProtocol,
	host: config.docsHost,
	port: config.docsPort
});
// const docSpec = Object.freeze({
// 	...docsSpec,
// 	path: '/webpad/documents{{query}}',
// 	headers: {
// 		'content-type': 'application/json',
// 		cookie: '{{dbSession}}'
// 	}
// });
// const userSpec = Object.freeze({
// 	...docsSpec,
// 	path: '/users/{{user}}',
// 	headers: {
// 		accept: 'application/json',
// 		'content-type': 'application/json',
// 		cookie: '{{dbSession}}'
// 	}
// });

module.exports = Object.freeze({
	// using fetch so I can easily grab the cookie
	// mongoAuth: {
	// 	method: 'fetch',
	// 	fetchMethod: 'post',
	// 	...docsSpec,
	// 	path: '/login',
	// 	headers: {
	// 		'accept': 'application/json; q=0',
	// 		'content-type': 'application/x-www-form-urlencoded'
	// 	},
	// 	body: {
	// 		username: '{{username}}',
	// 		password: '{{password}}'
	// 	}
	// }
});
