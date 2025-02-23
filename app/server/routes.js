const express = require('express');
const Logger = require('log-ng');
const path = require('path');
const config = require('./config.js');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));
const router = express.Router();

router.get('/', (req, res) => {
	logger.info('Hello, Winston!');
	res.render('index', {
		text: 'We can at least start from a sane place.',
		title: config.appDescription
	});
});
router.post('/click', (_req, res) => {
	logger.debug('post click');
	res.render('click', {});
});

module.exports = router;

