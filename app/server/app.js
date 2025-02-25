const express = require('express');
const Logger = require('log-ng');
const config = require('./config.js');

const app = express();
Logger(config);

module.exports = app;
