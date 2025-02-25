db = db.getSiblingDB('admin');
db.createUser ({
	user: 'admin',
	pwd: 'correcthorsebatterystaple',
	roles : [
		'readWriteAnyDatabase',
		'dbAdminAnyDatabase'
	]
});

// db = db.getSiblingDB('webapptemplate')
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

