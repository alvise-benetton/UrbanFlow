const userService = require("../services/user.services.js");
const express = require('express');
const router = express.Router();

router.get('/',userService.getUsers);
router.get('/:id',userService.getUserById);
router.post('/',userService.createUser);
router.put('/:id',userService.updateUser);
router.delete('/:id',userService.deleteUser);


module.exports = router;