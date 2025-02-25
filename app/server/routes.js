// const cors = require('cors');
const { authenticateRequest } = require('./auth.js');
const express = require('express');
const Logger = require('log-ng');
const path = require('path');
const config = require('./config.js');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));
const router = express.Router();

router.use(authenticateRequest);
router.post('/login', (_req, res) => {
	res.status(204).end();
});
router.use('/logout', (req, res, next) => {
	req.logout((err) => {
		if(err){
			return next(err);
		}
		res.redirect('/');
	});
});
router.get('/serverInfo', (_req, res) => {
	logger.info('Hello, Winston!');
	res.render('index', {
		text: `${Object.entries(config).map(([key, value]) => `${key}: ${value}`).join('<br />')}`,
		title: config.appDescription
	});
});
router.post('/click', (_req, res) => {
	logger.debug('post click');
	res.render('click', {});
});

module.exports = router;

