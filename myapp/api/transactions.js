const express               = require('express');
const router                = express.Router();
const transactionController = require('../controller/transactionController.js');

// /api/transactions
router.post('/',                          transactionController.createTransaction);
router.get('/',                           transactionController.getUserTransactions);
router.get('/seller/:seller_id',          transactionController.getSellerTransactions);
router.get('/buyer/:buyer_id',            transactionController.getBuyerTransactions);

module.exports = router;
