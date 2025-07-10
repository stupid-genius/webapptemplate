const express = require('express');
const Logger = require('log-ng');
const config = require('./config.js');

const app = express();
Logger(config);
const apiClient = require('apiclient')(require('./registry.js'));

module.exports = {
	app,
	apiClient
};
