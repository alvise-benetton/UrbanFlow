userService = require("../services/user.service.js");

const express = require('express');
const router = express.Router();

router.get('/',userService.getUser);
//router.get('/:id',userService.getUserById);

router.post('/',userService.createUser);


module.exports = router;