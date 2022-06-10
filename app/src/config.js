const packageJson = require(process.env.npm_package_json);

module.exports = Object.freeze({
	appName: packageJson.name,
	appDescription: packageJson.description,
	appVersion: packageJson.version,
	appHost: process.env.APPHOST || '0.0.0.0',
	appPort: process.env.APPPORT || 3000,
	logFile: process.env.LOGFILE || 'app.log',
	logLevel: process.env.LOGLEVEL || (process.env.NODE_ENV==='production'?'info':'debug'),
	nodeEnv: process.env.NODE_ENV || 'not set'
});

