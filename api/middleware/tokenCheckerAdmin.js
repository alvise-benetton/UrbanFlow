const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const blacklist = new Set(); // Blacklist dei token

const tokenCheckerAdmin = function(req, res, next) {
	try{
		let token = req.headers['x-access-token'];
	
		// if there is no token 	
		if (!token || blacklist.has(token)){
			return res.status(401).json({ error: 'Nessun token'});
		}

		// decode token, verifies secret and checks exp
		jwt.verify(token, process.env.SUPER_SECRET, function(err, decoded) {			
			if (err) {
				return res.status(403).json({
					error: 'Autenticazione fallita'
				});		
			} else {
				if (decoded.role !== 'admin') {
					return res.status(403).json({
					error: 'Accesso negato: ruolo non autorizzato'
					});
				}
				// if everything is good, save to request for use in other routes
				req.user = decoded;
				next();
			}
		});
	}catch(error){
		//console.error("errore durante il check token admin:", error);
		res.status(500).json({
			error:"Errore interno: " + error
		})
	}	
	// check header
	
	
};

module.exports = {tokenCheckerAdmin,blacklist}