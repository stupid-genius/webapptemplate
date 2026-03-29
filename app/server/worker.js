const { app } = require('./app.js');
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
const process = require('node:process');
const config = require('./config.js');
const DocsClient = require('./DocsClient.js');
const Model = require('./model/model.js');
const router = require('./routes.js');

const logger = new Logger(path.basename(__filename));

const sessionStore = new RedisStore({
	client: new ioredis({
		host: config.keyval.host,
		port: config.keyval.port
	}),
	prefix: 'valkey-sess:',
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('common'));
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

// TODO move to master process
app.use('/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
		uptime: process.uptime()
	});
});

app.use(servefavicon(path.join(__dirname, '../client/favicon.ico')));
app.use('/robots.txt', express.static(path.join(__dirname, '../client/robots.txt')));
app.use('/styles/login.css', express.static(path.join(__dirname, '../client/styles/login.css')));
app.use('/login.html', express.static(path.join(__dirname, '../client/login.html')));

app.use(router);
app.use(express.static(path.join(__dirname, '../client')));
// TODO optimize static file serving by using X-Accel-Redirect and letting nginx handle it
// but need to check if nginx is present first
// app.use((req, res, next) => {
// 	const filePath = path.resolve('../client', `./${req.path}`);

// 	if(!filePath.startsWith('../client')){
// 		return next();
// 	}

// 	fs.stat(filePath, (err, stats) => {
// 		if(!err && stats.isFile()){
// 			const internalPath = `/internal${req.path}`;
// 			res.setHeader('X-Accel-Redirect', internalPath);

// 			if(req.path.endsWith('.css')){
// 				res.setHeader('Content-Type', 'text/css');
// 			} else if(req.path.endsWith('.js')){
// 				res.setHeader('Content-Type', 'application/javascript');
// 			} else if(req.path.endsWith('.svg')){
// 				res.setHeader('Content-Type', 'image/svg+xml');
// 			}

// 			return res.status(200).end();
// 		}
// 		next();
// 	});
// });

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

	app.listen(config.app.port, config.app.host, () => {
		logger.debug(`server running in ${config.nodeEnv} mode`);
		logger.info(`server listening on port ${config.app.port}`);
	});
}).catch((e) => {
	logger.error(`Initializing model: ${e}`);
	process.exit(1);
});

function flushLogs(){
	return new Promise((resolve) => {
		logger.on('finish', resolve);
	});
}

async function handleProcessExit(signal) {
	logger.info(`${signal} received. Closing connections...`);
	await DocsClient.closeAll();
	await flushLogs();
	process.exit(0);
}

// Handle graceful MongoDB shutdown
process.on('SIGINT', handleProcessExit);
process.on('SIGTERM', handleProcessExit);
