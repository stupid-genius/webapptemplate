const bcrypt = require('bcrypt');

const saltRounds = 10;

const isBcryptHash = (s) => /^\$2[abyx]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(s);
function hashPassword(password){
	bcrypt.hash(password, saltRounds, function(err, hash){
		if(err){
			console.error('Error hashing password:', err);
			process.exit(1);
		}
		console.log('Hashed password:', hash);
	});
}
function validatePassword(password, hash){
	bcrypt.compare(password, hash, (err, result) => {
		if(err){
			console.error('Error comparing password:', err);
			process.exit(1);
		}
		if(result){
			console.log('Password is valid.');
		}else{
			console.log('Password is invalid.');
			process.exit(1);
		}
	});
};

const password = process.argv[2];
const hash = process.argv[3];

if(password){
	if(hash && isBcryptHash(hash)){
		validatePassword(password, hash);
	}else{
		hashPassword(password);
	}
}else{
	let input = '';
	// process.stdin.setEncoding('utf8');
	process.stdin.on('data', chunk => input += chunk);
	process.stdin.on('end', () => {
		input = input.trim();
		if(input){
			hashPassword(input);
			process.exit(0);
		}else{
			console.error('No password provided. Please provide a password as an argument or via standard input.');
			process.exit(1);
		}
	});

	if(process.stdin.isTTY){
		console.error('Usage: node passhash.js <password>');
		process.exit(1);
	}
}

