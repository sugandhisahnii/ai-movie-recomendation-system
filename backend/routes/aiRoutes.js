const express = require('express');
const router = express.Router();
const { nlpSearch } = require('../controllers/aiController');

router.post('/search', nlpSearch);

module.exports = router;
