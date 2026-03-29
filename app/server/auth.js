const bcrypt = require('bcrypt');
const BearerStrategy = require('passport-http-bearer');
const LocalStrategy = require('passport-local').Strategy;
const Logger = require('log-ng');
const { ObjectId } = require('mongodb');
const passport = require('passport');
const path = require('node:path');
const {auth: OIDC, requiresAuth} = require('express-openid-connect');
const {app} = require('./app.js');
const config = require('./config.js');
const DocsClient = require('./DocsClient.js');

const logger = new Logger(path.basename(__filename));

let authenticateRequest;
const connectionString = `mongodb://admin:${config.docs.pass}@${config.docs.host}:${config.docs.port}/${config.docs.db}?authSource=admin&authMechanism=SCRAM-SHA-256`;

passport.use('bearer', new BearerStrategy(
	async function(token, done){
		logger.debug('Authenticating via bearer token');

		try{
			const mc = await DocsClient(connectionString);
			const user = await mc.collection('users').findOne({
				token
			});
			if(!user){
				logger.warn(`Invalid token: ${token}`);
				return done(null, false);
			}
			logger.info(`Successfully authenticated token user ${user.username}`);
			return done(null, {
				db: mc,
				user
			});
		}catch(err){
			logger.error(`Token auth error: ${err}`);
			return done(err);
		}
	}
));
passport.use('local', new LocalStrategy(
	async function(username, password, done){
		if(!username || !password){
			logger.warn('Username or password not provided');
			return done(null, false, { message: 'Missing credentials' });
		}

		logger.debug(`Authenticating via local account: ${username}`);
		username = username.toLowerCase(); // FIXME
		try{
			const mc = await DocsClient(connectionString);
			const user = await mc.collection('users').findOne({
				$or: [
					{email: username},
					{username}
				]
			});
			if(!user){
				logger.warn(`User not found: ${username}`);
				return done(null, false, { message: 'Incorrect username or email.' });
			}

			const isValid = await bcrypt.compare(password, user.password);
			if(!isValid){
				logger.warn(`Invalid password for user: ${username}`);
				return done(null, false, { message: 'Incorrect password.' });
			}

			logger.info(`Successfully authenticated ${username}`);
			return done(null, {
				db: mc,
				user
			});
		}catch(e){
			logger.error(`Authentication error for ${username}: ${e}`);
			return done(e);
		}
	}
));

switch(config.auth.strategy){
case 'oidc': {
	app.use(
		OIDC({
			authRequired: false,
			issuerBaseURL: config.auth.OIDCProviderMetadataURL,
			baseURL: `${config.app.URL}:${config.app.port}`,
			clientID: config.auth.OIDCClientID,
			clientSecret: config.auth.OIDCClientSecret,
			secret: config.sessionSecret,
			authorizationParams: {
				response_type: 'code',
				// response_mode: 'form_post' // or 'query' for HTTP dev
			}
		})
	);
	authenticateRequest = requiresAuth();
	const oidcAuth = requiresAuth();
	authenticateRequest = function(req, res, next){
		if(req.isAuthenticated()){
			logger.debug(`${req.user.username} has a valid session`);
			next();
		}else{
			logger.debug(`Checking auth for request ${req.url}`);
			oidcAuth(req, res, async function(err){
				if(err){
					logger.warn(`Failed to authenticate: ${err}`);
					return next(err);
				}

				if(req.oidc?.isAuthenticated() && req.oidc?.user){
					const token = req.oidc.user;
					logger.debug(`User authenticated via OIDC: ${JSON.stringify(token)}`);
					const mc = await DocsClient(connectionString);
					const user = await mc.collection('users').findOne({
						email: token.email.toLowerCase()
					});
					logger.debug(`Mapped OIDC user to local user: ${JSON.stringify(user)}`);
					if(user === null){
						logger.warn(`User ${token.email} not found in local database`);
						return next(new Error('User not found in local database'));
					}
					req.login({user}, function(loginErr){
						if(loginErr){
							logger.error(`Failed to create Passport session: ${loginErr}`);
							return next(loginErr);
						}
						next();
					});
				}else{
					next(new Error('User is not authenticated'));
				}
			});
		}
	};
	break;
}
case 'passkey':
case 'qr':
default:
	logger.warn(`Unrecognized passport strategy: ${config.auth.strategy}−defaulting to LocalStrategy`);
	/* fallthrough */
case 'local':
	authenticateRequest = function(req, res, next){
		if(req.isAuthenticated()){
			logger.debug(`${req.user.user.username} has a valid session`);
			next();
		}else{
			logger.debug(`Checking local credentials for request ${req.url}`);
			if(req.headers['authorization']?.startsWith('Bearer ')){
				passport.authenticate('bearer', {session: false})(req, res, next);
			}else if(req.headers?.accept?.includes('application/json')){
				logger.debug('API request detected, no response');
				passport.authenticate('local', {
				}, (err, user, info) => {
					if(err){
						logger.error(err);
						return next(err);
					}
					if(info !== undefined){
						logger.info(`Authentication info: ${JSON.stringify(info)}`);
					}
					if(!user){
						logger.warn('Not authenticated');
						return res.status(401).end();
					}
					req.login(user, (err) => {
						if(err){
							logger.error(err);
							return next(err);
						}
						logger.debug(`User ${user.user.username} logged in via API`);
						res.status(204).end();
					});
				})(req, res, next);
			}else{
				logger.debug('Web request detected, using redirect');
				passport.authenticate('local', {
					// failureFlash: true,
					// failureMessage: true,
					failureRedirect: '/login.html',
					successRedirect: '/'
				})(req, res, next);
			}
		}
	};
	break;
}

passport.serializeUser((user, done) => {
	logger.debug(`Serializing user ${JSON.stringify(user)}`);
	done(null, user.user._id.toString('hex'));
});

passport.deserializeUser(async (id, done) => {
	logger.debug(`Deserializing user ${id}`);
	try{
		const mc = await DocsClient(connectionString);
		const user = await mc.collection('users').findOne({
			_id: new ObjectId(id)
		});
		done(null, {db: mc, user});
	}catch(e){
		logger.error(`Deserialization failed: ${e}`);
		done(e);
	}
});

module.exports = {
	authenticateRequest
};
