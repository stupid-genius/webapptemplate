const process = require('node:process');
const packageJson = require(process.env.npm_package_json);

module.exports = Object.freeze({
	appDescription: packageJson.description,
	logFile: process.env.LOGFILE || 'app.log',
	logLevel: process.env.LOGLEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
	nodeEnv: process.env.NODE_ENV || 'not set',
	sessionSecret: process.env.SESSION_SECRET,
	app: {
		host: process.env.APPHOST || '0.0.0.0',
		name: packageJson.name,
		port: process.env.APPPORT || 3000,
		URL: process.env.APPURL || 'https://example.com',
		version: packageJson.version,
	},
	auth: {
		strategy: process.env.AUTH_STRATEGY || 'local',
		OIDCClientID: process.env.OIDC_CLIENT_ID,
		OIDCClientSecret: process.env.OIDC_CLIENT_SECRET,
		OIDCProviderMetadataURL: process.env.OIDC_PROVIDER_URL,
		OIDCScope: process.env.OIDC_SCOPE || 'openid'
	},
	db: {
		host: process.env.DBHOST || 'mysql',
		pass: process.env.DB_ROOT_PASSWORD,
		port: process.env.DBPORT || 3306,
		maxRecords: process.env.MAX_RECORDS || 10_000
	},
	docs: {
		host: process.env.DOCSHOST || 'mongo',
		pass: process.env.DOCS_ROOT_PASSWORD,
		port: process.env.DOCSPORT || 27017,
		db: process.env.DOCSDB || 'webapptemplate'
	},
	keyval: {
		host: process.env.KEYVALHOST || 'valkey',
		port: process.env.KEYVALPORT || 6379
	}
});
