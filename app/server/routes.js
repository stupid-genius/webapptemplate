// const cors = require('cors');
const express = require('express');
const Logger = require('log-ng');
const path = require('path');
const { authenticateRequest } = require('./auth.js');
const config = require('./config.js');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));
const router = express.Router();

router.use(authenticateRequest);
router.post('/login', (req, res) => {
	res.redirect('/');
});
router.use('/logout', (req, res, next) => {
	req.logout((err) => {
		if(err){
			logger.error(`Logout error: ${err}`);
			return next(err);
		}
		res.redirect('/');
	});
});

router.get('/', (_req, res) => {
	res.render('index', {
		text: 'Hello, world!',
		title: config.appDescription
	});
});
router.get('/serverInfo', (_req, res) => {
	logger.info('Hello, Winston!');
	res.render('index', {
		text: `${Object.entries(config).map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`).join('<br />')}`,
		title: config.appDescription
	});
});
router.post('/click', (_req, res) => {
	logger.debug('post click');
	res.render('click', {});
});

module.exports = router;

