const assert = require('node:assert');
const Logger = require('log-ng');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('node:path');
const sinon = require('sinon');
const DocsClient = require('../../app/server/DocsClient.js');

const logger = new Logger(path.basename(__filename));

describe('DocsClient', function(){
	this.timeout(10e3);

	let config, mongod, sandbox, uri;

	before(async () => {
		mongod = await MongoMemoryServer.create();
		uri = mongod.getUri();

		process.env.DOCSHOST = '127.0.0.1';
		process.env.DOCSPORT = uri.match(/:(\d+)\//)[1];
		process.env.DOCSDB = 'test';
		config = require('../../app/server/config.js');
	});

	after(async () => {
		await mongod.stop();
	});

	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});

	afterEach(async () => {
		await DocsClient.closeAll();
		sandbox.restore();
	});

	it('should connect using connection string directly', async () => {
		const client = await DocsClient(uri);
		assert(client);
		assert.strictEqual(typeof client.collection, 'function');
		await client.close();
	});

	it('should connect using username/password config path', async () => {
		this.timeout(10e3);
		const constructedUri = `mongodb://user:pass@${config.docs.host}:${config.docs.port}/${config.docs.db}?authSource=admin&authMechanism=SCRAM-SHA-256`;

		// const fakeClient = {
		// 	connect: sinon.stub().rejects(new Error('forced connection failure'))
		// };
		//
		// sandbox.stub(mongodb, 'MongoClient').callsFake(function () {
		// 	return fakeClient;
		// });

		DocsClient.cache.set(constructedUri, Object.create({
			close: async () => {},
			collection: () => {},
			isConnected: async () => true
		}));

		try{
			await assert.rejects(async () => DocsClient('user', 'bogus', 'admin'), /getaddrinfo ENOTFOUND mongo/ );
			const client = await DocsClient('user', 'pass', 'admin');
			assert(client);
			assert.strictEqual(typeof client.collection, 'function');
		}catch(err){
			assert.fail(`Connection failed: ${err.message}`);
		}
	});

	it('should cache and reuse client if connected', async () => {
		const client1 = await DocsClient(uri);
		const client2 = await DocsClient(uri);
		assert.strictEqual(client1, client2);
		await client1.close();
		assert.strictEqual(DocsClient.cache.size, 0, 'Cache should be empty after close');
	});

	it('should remove client from cache if not connected', async () => {
		const client1 = await DocsClient(uri);
		await client1.close();

		// simulate stale client
		const client2 = await DocsClient(uri);
		assert.notStrictEqual(client1, client2);
		await client2.close();
	});

	it('should close individual client', async () => {
		const client = await DocsClient(uri);
		const spy = sinon.spy(client, 'close');
		await client.close();
		assert(spy.calledOnce);
	});

	it('should expose collection access for default db', async () => {
		const client = await DocsClient(uri);
		const collection = client.collection('foo', config.docs.db);
		assert(collection);
		assert.strictEqual(collection.collectionName, 'foo');
		await client.close();
	});

	it('should close all cached clients via closeAll()', async () => {
		const connString1 = `${uri}db1`;
		const connString2 = `${uri}db2`;

		logger.debug(`Connecting to ${connString1} and ${connString2}`);
		await DocsClient(connString1);
		await DocsClient(connString2);

		const internal1 = DocsClient.cache.get(connString1);
		const internal2 = DocsClient.cache.get(connString2);

		const closeSpy1 = sinon.spy(internal1, 'close');
		const closeSpy2 = sinon.spy(internal2, 'close');

		assert.strictEqual(DocsClient.cache.size, 2);
		await DocsClient.closeAll();

		assert(closeSpy1.calledOnce, 'Expected client1 to be closed');
		assert(closeSpy2.calledOnce, 'Expected client2 to be closed');
		assert.strictEqual(DocsClient.cache.size, 0, 'Expected cache to be empty');
	});
});
