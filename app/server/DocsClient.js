const Logger = require('log-ng');
const {MongoClient} = require('mongodb');
const path = require('node:path');
const config = require('./config.js');

const logger = new Logger(path.basename(__filename));

/**
 * DocsClient is a MongoDB client for connecting to the MongoDB database
 * It supports connection pooling and caching of connections.
 * @param username
 * @param password
 * @param authDB
 * @returns {Promise<DocsClient>}
 * @constructor
 */
async function DocsClient(username, password, authDB){
	const connectionString = arguments.length === 1 && arguments[0]?.startsWith('mongodb://') ? arguments[0]
		: `mongodb://${username}:${password}@${config.docs.host}:${config.docs.port}/${config.docs.db}?authSource=${authDB}&authMechanism=SCRAM-SHA-256`;

	logger.debug(`Connecting to MongoDB at ${connectionString}`);
	if(DocsClient.cache.has(connectionString)){
		const cached = DocsClient.cache.get(connectionString);
		if(await cached.isConnected?.()){
			logger.debug(`Returning cached DocsClient instance: ${connectionString}`);
			return cached;
		}else{
			logger.debug('Cached DocsClient instance is not connected, removing from cache');
			DocsClient.cache.delete(connectionString);
		}
	}

	logger.debug('Creating DocsClient instance');
	const self = Object.create({});

	logger.debug(`Attempting to open connection: ${connectionString}`);
	let client = new MongoClient(connectionString, {
		maxPoolSize: 20,
		minPoolSize: 1,
		maxIdleTimeMS: 120e3,
		serverSelectionTimeoutMS: 5e3,
		socketTimeoutMS: 5e3
	});
	try{
		await client.connect();
		await client.db(config.docs.db).command({ping: 1});
		DocsClient.cache.set(connectionString, self);
		logger.info('MongoDB connection established');
	}catch(err){
		logger.error('Failed to connect to MongoDB:', err);
		throw err;
	}
	Object.defineProperties(self, {
		close: {
			configurable: true,
			writable: true,
			value: async function(){
				await client.close();
				client = undefined;
				DocsClient.cache.delete(connectionString);
				logger.info('MongoDB connection closed');
			}
		},
		collection: {
			value: function(collectionName, db){
				return client.db(db).collection(collectionName);
			}
		},
		isConnected: {
			value: async function(){
				try{
					await client.db(config.docs.db).command({ping: 1});
					return true;
				}catch{
					logger.warn('MongoDB connection is not active');
					return false;
				}
			}
		}
	});

	return self;
}

Object.defineProperties(DocsClient, {
	cache: {
		value: new Map()
	},
	closeAll: {
		value: async function(){
			const clientClosing = [...DocsClient.cache.values()].map((client) => client.close());
			DocsClient.cache.clear();
			await Promise.allSettled(clientClosing);
		}
	}
});

module.exports = DocsClient;
