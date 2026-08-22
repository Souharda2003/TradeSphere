const express = require("express");

const router = express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const {
    downloadInvoice
} = require("../controllers/invoiceController");


/*
==================================================
DOWNLOAD CUSTOMER INVOICE
==================================================
*/

router.get(
    "/:referenceNo/invoice",
    authenticateToken,
    downloadInvoice
);


module.exports = router;