const packageJson = require(process.env.npm_package_json);

module.exports = Object.freeze({
	appName: packageJson.name,
	appDescription: packageJson.description,
	appVersion: packageJson.version,
	appHost: process.env.APPHOST || '0.0.0.0',
	appPort: process.env.APPPORT || 3000,
	appURL: process.env.APPURL || 'http://localhost:9000',
	authStrategy: process.env.AUTH_STRATEGY || 'local',
	dbHost: process.env.DBHOST || 'mysql',
	dbPort: process.env.DBPORT || 3306,
	dbPass: process.env.DB_ROOT_PASSWD,
	docsHost: process.env.DOCSHOST || 'mongo',
	docsPort: process.env.DOCSPORT || 27017,
	docsProtocol: process.env.DOCSPROTOCOL || 'http',
	logFile: process.env.LOGFILE || 'app.log',
	logLevel: process.env.LOGLEVEL || (process.env.NODE_ENV==='production'?'info':'debug'),
	nodeEnv: process.env.NODE_ENV || 'not set',
	OIDCClientID: process.env.OIDC_CLIENT_ID,
	OIDCClientSecret: process.env.OIDC_CLIENT_SECRET,
	OIDCProviderMetadataURL: process.env.OIDC_PROVIDER_URL,
	OIDCScope: process.env.OIDC_SCOPE || 'openid',
	sessionSecret: process.env.SESSION_SECRET,
	keyvalHost: process.env.KEYVALHOST || 'valkey',
	keyvalPort: process.env.KEYVALPORT || 6379,
});

