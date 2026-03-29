require('./app.js');

const cluster = require('node:cluster');
const Logger = require('log-ng');
const os = require('node:os');
const path = require('node:path');

const logger = new Logger(path.basename(__filename));
const numCPUs = os.cpus().length;

if(cluster.isPrimary){
	logger.info(`Master ${process.pid} is running`);

	for(let i = 0; i < numCPUs; i++){
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		logger.warn(`Worker ${worker.process.pid} died (code ${code}, signal ${signal}). Restarting...`);
		cluster.fork();
	});
	cluster.on('online', (worker) => {
		logger.info(`Worker ${worker.process.pid} is online`);
	});
	cluster.on('listening', (worker, address) => {
		logger.info(`Worker ${worker.process.pid} is listening on ${address.address}:${address.port}`);
	});
	cluster.on('disconnect', (worker) => {
		logger.warn(`Worker ${worker.process.pid} disconnected`);
	});
}else{
	require('./worker.js');
}

function handleProcessExit(){
	for(const id in cluster.workers){
		cluster.workers[id].process.kill('SIGTERM');
	}
	process.exit(0);
}

process.on('SIGTERM', handleProcessExit);
process.on('SIGINT', handleProcessExit);

// Handle unhandled promise rejections to prevent app crashes
process.on('unhandledRejection', (reason, promise) => {
	logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`);
});

process.on('uncaughtException', (error) => {
	logger.error(`Uncaught Exception: ${error.message}\nStack Trace: ${error.stack}`);
});

