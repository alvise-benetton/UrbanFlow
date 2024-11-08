const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const blacklist = new Set(); // Blacklist dei token

	const tokenChecker = function(req, res, next) {
		
		// check header
		let token = req.headers['x-access-token'];
		
		// if there is no token
		if (!token || blacklist.has(token)){
			return res.status(401).json({ error: 'Nessun token'});
		}

		// decode token, verifies secret and checks exp
		jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {			
			if (err) {
				return res.status(403).json({
					error: 'Autenticazione fallita'
				});		
			} else {
				// if everything is good, save to request for use in other routes
				req.user = decoded;
				next();
			}
		});
		
	};

module.exports = {tokenChecker,blacklist}