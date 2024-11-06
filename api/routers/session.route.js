sessionService = require("../services/session.serivice");

const express = require('express');
const router = express.Router();

router.post('/',sessionService.createSession);
router.delete('/',sessionService.deleteSession);

module.exports = router;