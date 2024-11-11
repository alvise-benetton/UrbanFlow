const express = require('express');
const tokenChecker = require("../middleware/tokenChecker").tokenChecker;
const sessionService = require("../services/session.serivice");
const router = express.Router();

router.post('/',sessionService.createSession);
router.delete('/',tokenChecker,sessionService.deleteSession);


module.exports = router;