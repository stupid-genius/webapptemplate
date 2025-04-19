const express = require('express');
const Logger = require('log-ng');
const morgan = require('morgan');
const servefavicon = require('serve-favicon');
const path = require('path');
const config = require('./config.js');

Logger(config);
const logger = new Logger(path.basename(__filename));

const app = express();

/* eslint-disable-next-line no-undef */
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(morgan('common'));
/* eslint-disable-next-line no-undef */
app.use(servefavicon(path.join(__dirname, '../client/favicon.ico')));
app.use(require('./routes.js'));
/* eslint-disable-next-line no-undef */
app.use(express.static(path.join(__dirname, '../client')));

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/* eslint-disable no-unused-vars */
app.use((err, req, res, _next) => {
	res.status(err.status || 500);
	res.render('error', {
		error: logger.level === 'debug' ? err : {},
		message: err.message,
		title: 'Error'
	});
});

app.listen(config.appPort, () => {
	logger.debug(`server running in ${config.nodeEnv} mode`);
	logger.info(`server listening on port ${config.appPort}`);
});

