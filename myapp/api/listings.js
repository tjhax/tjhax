const express = require('express');
const router = express.Router();
const listingController = require('../controller/listingController.js');
const { route } = require('./routes.js');

// "/" is actually GET /api/listings/

router.get("/", listingController.viewListing);

router.get("/search", listingController.search);

//api/listings/id number
router.get('/:id',listingController.idSearch);

router.patch('/:id/status', listingController.updateStatus);
router.delete('/:id',listingController.deleteListing);//NEW

//posting new listing
router.post('/', listingController.createListing);

router.patch('/:id', listingController.updateListing);

module.exports = router;
