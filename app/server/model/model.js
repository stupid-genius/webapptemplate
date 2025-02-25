const { execSync } = require('child_process');
const Logger = require('log-ng');
const path = require('path');
const { Sequelize } = require('sequelize');
const config = require('../config.js');

const logger = new Logger(path.basename(__filename));

async function connectORM(){
	if(connectORM.instance !== undefined){
		return connectORM.instance;
	}
	const sequelize = new Sequelize('WEBAPPTEMPLATE', 'root', config.dbPass, {
		host: config.dbHost,
		port: config.dbPort,
		dialect: 'mysql',
		logging: (...msg) => logger.debug(msg)
	});
	try{
		logger.debug('Attempting db connection');
		await sequelize.authenticate();
		logger.info('Connection has been successfully established.');
	}catch(error){
		logger.error('Unable to connect to the database:', error);
		throw error;
	}

	connectORM.instance = sequelize;
	return sequelize;
}

async function initialize(syncOptions){
	const sequelize = await connectORM();

	await sequelize.sync(syncOptions);
	logger.info(migrate());
}

function backup(filename){
	return execSync(`./backup.sh ${filename}`, {cwd: __dirname});
}
function migrate(){
	return execSync('./migrations.sh', {cwd: __dirname});
}
function restore(filename){
	return execSync(`./restore.sh ${filename}`, {cwd: __dirname});
}

module.exports = {
	backup,
	initialize,
	migrate,
	restore
};
