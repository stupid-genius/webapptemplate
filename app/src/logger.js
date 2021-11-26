const {createLogger, format, transports} = require('winston');

function Logger(fileName){
	if(!(this instanceof Logger)){
		return new Logger(fileName);
	}
	if(Logger.instance === undefined){
		Object.defineProperty(Logger, 'instance', {
			value: createLogger({
				level: 'debug',
				transports: [new transports.Console({
					format: format.combine(
						format.colorize(),
						format.timestamp(),
						format.metadata(),
						format.align(),
						format.simple()
						//format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
					),
				})]
			})
		});
	}

	const logger = Logger.instance.child({
		fileName
	});
	return logger;
}

module.exports = Logger;
