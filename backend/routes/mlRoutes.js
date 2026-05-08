const express = require('express');
const { mlCollection, mlSearch, mlMood } = require('../controllers/mlController');

const router = express.Router();

router.get('/search', mlSearch);
router.get('/mood', mlMood);
router.get('/collection', mlCollection);

module.exports = router;
