const express = require("express");

const router =
    express.Router();


const authenticateToken =
    require("../middleware/authMiddleware");


const {

    createOrder,

    getMyOrders,
    getOrderDetails,
    cancelOrder

} = require(
    "../controllers/orderController"
);


/*
=========================================
CUSTOMER ORDERS
=========================================
*/

router.get(

    "/my",

    authenticateToken,

    getMyOrders

);
/*
=========================================
SINGLE CUSTOMER ORDER DETAILS
=========================================
*/

router.get(

    "/:referenceNo",

    authenticateToken,

    getOrderDetails

);
router.post(
    "/",
    authenticateToken,
    createOrder
    );
router.put(

    "/:referenceNo/cancel",

    authenticateToken,

    cancelOrder

);


module.exports =
    router;