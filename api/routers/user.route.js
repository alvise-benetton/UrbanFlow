const userService = require("../services/user.services.js");
const express = require('express');
const router = express.Router();
const tokenCheckerAdmin = require('../middleware/tokenCheckerAdmin.js').tokenCheckerAdmin;

router.get('/',tokenCheckerAdmin,userService.getUsers);
router.get('/:id',userService.getUserById);
router.post('/',userService.createUser);
router.put('/:id',tokenCheckerAdmin, userService.updateUser); // in realtà bisogna distinguere i 2 casi (modificare se stessi e altro utente)
router.delete('/:id',userService.deleteUser);


module.exports = router;        