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
	const sequelize = new Sequelize('WEBAPPTEMPLATE', 'root', config.db.pass, {
		host: config.db.host,
		port: config.db.port,
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

async function initialize(){
	logger.info('Initializing models...');
	// const sequelize = await connectORM();

	// initialize models
}

async function sync(syncOptions){
	logger.info('Synchronizing models with databases...');
	const sequelize = await connectORM();
	const docsClient = await DocsClient(`mongodb://admin:${config.docs.pass}@${config.docs.host}:${config.docs.port}/${config.docs.db}?authSource=admin&authMechanism=SCRAM-SHA-256`);

	logger.info('Synchronizing schema...');
	await sequelize.sync(syncOptions);
	logger.info('Check for migrations...');
	logger.info(migrate());
}

function backup(filename=''){
	logger.info(`Creating backup${filename ? ` with filename: ${filename}` : ''}`);
	try{
		return execSync(`./backup.sh ${filename}`, {
			cwd: __dirname,
			encoding: 'utf8'
		});
	}catch(error){
		logger.error(`Error running backup: ${error.message}`);
		throw error;
	}
}
function migrate(){
	return execSync('./migrations.sh', {cwd: __dirname});
}
function restore(date, filename=''){
	logger.info(`Restoring backup for date: ${date}${filename ? ` with filename: ${filename}` : ''}`);
	try{
		return execSync(`./restore.sh ${date} ${filename}`, {
			cwd: __dirname,
			encoding: 'utf8'
		});
	}catch(error){
		logger.error(`Error running restore: ${error.message}`);
		throw error;
	}
}

module.exports = {
	backup,
	initialize,
	migrate,
	sync,
	restore
};
