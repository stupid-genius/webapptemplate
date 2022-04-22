const express = require('express');
const morgan = require('morgan');
const servefavicon = require('serve-favicon');
const path = require('path');
const Logger = require('./logger');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));

const app = express();

/* eslint-disable-next-line no-undef */
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(morgan('common'));
app.use(servefavicon('./app/public/images/favicon.ico'));
app.use(require('./routes'));
/* eslint-disable-next-line no-undef */
app.use(express.static(path.join(__dirname, '../public')));

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

app.listen(3000, () => {
	logger.info('server listening on port 3000');
});

