db = db.getSiblingDB('admin');
db.createUser ({
	user: 'admin',
	pwd: 'correcthorsebatterystaple',
	roles : [
		'readWriteAnyDatabase',
		'dbAdminAnyDatabase'
	]
});

db = db.getSiblingDB('webapptemplate')
db.createUser ({
	user: 'webapptemplate-admin',
	pwd: 'correcthorsebatterystaple',
	roles: [
		{
			role: 'readWrite',
			db: 'webapptemplate'
		},
		{
			role: 'dbAdmin',
			db: 'webapptemplate'
		}
	]
});

// Create users collection and add default admin user
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.users.insertOne({
	email: 'none@example.com',
	username: 'admin',
	password: '$2b$10$SgcV45jtX3LeB4sh9gt3suhuzLLqQN.YsLbEcOMYjhicbO9tVA0We',
	token: 'Y29ycmVjdGhvcnNlYmF0dGVyeXN0YXBsZQo=',
});

