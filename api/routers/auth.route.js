authService = require("../services/auth.serivice");

const express = require('express');
const router = express.Router();

router.post('/login',authService.login);
router.post('/register',authService.register);



module.exports = router;