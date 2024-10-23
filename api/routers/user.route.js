userService = require("../services/user.service.js");

const express = require('express');
const router = express.Router();

router.get('/',userService.getUsers);
//router.get('/:id',userService.getUserById);

//router.post('/',userService.addUser);


module.exports = router;