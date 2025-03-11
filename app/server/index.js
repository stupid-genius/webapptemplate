const app = require('./app.js');
const bodyParser = require('body-parser');
const express = require('express');
const ioredis = require('ioredis');
const SessionManager = require('express-session');
const {RedisStore} = require('connect-redis');
const Logger = require('log-ng');
const morgan = require('morgan');
const servefavicon = require('serve-favicon');
const passport = require('passport');
const path = require('node:path');
const config = require('./config.js');
const Model = require('./model/model.js');

require('apiclient')(require('./registry.js'));
const logger = new Logger(path.basename(__filename));

const sessionStore = new RedisStore({
	client: new ioredis({
		host: config.keyvalHost,
		port: config.keyvalPort
	}),
	prefix: 'valkey-sess:',
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('common'));
app.use(servefavicon(path.join(__dirname, '../client/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/plain' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(SessionManager({
	resave: false,
	saveUninitialized: false,
	secret: config.sessionSecret,
	store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session({}));

app.use(express.static(path.join(__dirname, '../client')));
app.use(require('./routes.js'));

app.use((_req, _res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/* eslint-disable no-unused-vars */
app.use((err, _req, res, _next) => {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		stack: logger.level === 'debug' ? err.stack : {},
		status: err.status,
		title: 'Error'
	});
});

Model.initialize({alter: true}).then(() => {
	logger.info('Model initialized');
	app.listen(config.appPort, config.appHost, () => {
		logger.debug(`server running in ${config.nodeEnv} mode`);
		logger.info(`server listening on port ${config.appPort}`);
	});
}).catch((e) => {
	logger.error(`Initializing model: ${e}`);
	process.exit(1);
});
