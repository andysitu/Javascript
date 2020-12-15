const router = module.exports = require('express').Router();

router.use('/lodgings', require('./lodgings'));
router.use('/guests', require('./guests'));