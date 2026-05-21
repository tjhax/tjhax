const express = require('express');
const router = express.Router();
const myListingsController = require('../controller/my-listingsController.js');

router.get('/', myListingsController.getMyListings);

module.exports = router;
