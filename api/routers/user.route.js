const userService = require("../services/user.services.js");
const express = require('express');
const router = express.Router();
const tokenCheckerAdmin = require('../middleware/tokenCheckerAdmin.js').tokenCheckerAdmin;

router.get('/',userService.getUsers);
router.get('/:id',userService.getUserById);
router.post('/',userService.createUser);
router.put('/:id',tokenCheckerAdmin, userService.updateUser);
router.delete('/:id',userService.deleteUser);


module.exports = router;