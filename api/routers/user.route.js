const userService = require("../services/user.service.js");
const express = require('express');
const router = express.Router();

router.get('/users',userService.getUsers);
router.get('/users/:id',userService.getUserById);
router.post('/newUser',userService.createUser);
router.put('/users/:id',userService.updateUser);
router.delete('/users/:id',userService.deleteUser);


module.exports = router;