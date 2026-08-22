const express =
    require("express");


const router =
    express.Router();


const authenticateToken =
    require("../middleware/authMiddleware");


const requireRole =
    require("../middleware/roleMiddleware");


const {

    createOrder,

    getMyOrders,

    getOrderDetails,

    cancelOrder,

    getSellerOrderDetails,

    getSellerRecentOrders,

    getSellerAllOrders,

    acceptSellerOrder,

    rejectSellerOrder,

    updateSellerOrderStatus

} = require(
    "../controllers/orderController"
);


/*
==================================================
CUSTOMER ORDERS
==================================================
*/


router.get(
    "/my",
    authenticateToken,
    getMyOrders
);


/*
==================================================
SELLER ORDERS
==================================================
*/


/*
GET RECENT SELLER ORDERS

IMPORTANT:
This route MUST be before:

/seller/:orderId

Otherwise "recent" will be treated as orderId.
*/

router.get(
    "/seller/recent",
    authenticateToken,
    requireRole("SELLER"),
    getSellerRecentOrders
);


/*
GET ALL SELLER ORDERS
*/

router.get(
    "/seller/all",
    authenticateToken,
    requireRole("SELLER"),
    getSellerAllOrders
);


/*
GET SINGLE SELLER ORDER

This MUST remain AFTER
/seller/recent
and
/seller/all
*/

router.get(
    "/seller/:orderId",
    authenticateToken,
    requireRole("SELLER"),
    getSellerOrderDetails
);


/*
==================================================
SELLER ACCEPT ORDER
==================================================
*/


router.patch(
    "/seller/:orderId/accept",
    authenticateToken,
    requireRole("SELLER"),
    acceptSellerOrder
);


/*
==================================================
SELLER REJECT ORDER
==================================================
*/


router.patch(
    "/seller/:orderId/reject",
    authenticateToken,
    requireRole("SELLER"),
    rejectSellerOrder
);

router.patch(
    "/seller/:orderId/status",
    authenticateToken,
    requireRole("SELLER"),
    updateSellerOrderStatus
);
/*
==================================================
CREATE CUSTOMER ORDER
==================================================
*/


router.post(
    "/",
    authenticateToken,
    createOrder
);


/*
==================================================
CUSTOMER CANCEL ORDER
==================================================
*/


router.put(
    "/:referenceNo/cancel",
    authenticateToken,
    cancelOrder
);


/*
==================================================
CUSTOMER SINGLE ORDER
==================================================
*/


router.get(
    "/:referenceNo",
    authenticateToken,
    getOrderDetails
);


module.exports =
    router;