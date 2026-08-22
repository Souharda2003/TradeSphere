const express = require("express");

const router =
    express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const {
    getSellerOrders,
    getSellerRecentOrders,
    acceptSellerOrder,
    rejectSellerOrder
} = require(
    "../controllers/sellerOrderController"
);


/*
==================================================
SELLER ORDERS
==================================================
*/


/*
GET ALL SELLER ORDERS

Shows:
- PENDING_SELLER_ACCEPTANCE
- ACCEPTED
- REJECTED
- CANCELLED
- PROCESSING
- Any future status
*/

router.get(
    "/all",
    authenticateToken,
    getSellerOrders
);


/*
GET RECENT SELLER ORDERS

Used by Seller Dashboard.
*/

router.get(
    "/recent",
    authenticateToken,
    getSellerRecentOrders
);


/*
ACCEPT ORDER
*/

router.patch(
    "/:orderId/accept",
    authenticateToken,
    acceptSellerOrder
);


/*
REJECT ORDER
*/

router.patch(
    "/:orderId/reject",
    authenticateToken,
    rejectSellerOrder
);


module.exports = router;