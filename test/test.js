const path = require('path');
const Logger = require('../app/src/logger');

const logger = new Logger(path.basename(__filename));

describe('RouteHelper Unit Tests', function(){
	logger.info('Please write some tests; I\'m lonely');
	it('Should have tests');
});
