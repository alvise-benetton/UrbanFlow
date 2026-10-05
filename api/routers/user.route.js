const userService = require("../services/user.services.js");
const express = require('express');
const router = express.Router();
const tokenCheckerAdmin = require('../middleware/tokenCheckerAdmin.js').tokenCheckerAdmin;

router.get('/',tokenCheckerAdmin,userService.getUsers);
router.get('/:id',userService.getUserById);
router.post('/',tokenCheckerAdmin,userService.createUser);
router.put('/:id', userService.updateUser); 
router.delete('/:id', tokenCheckerAdmin, userService.deleteUser);


module.exports = router;        