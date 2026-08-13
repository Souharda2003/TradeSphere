const express = require("express");

const router =
    express.Router();


const authenticateToken =
    require("../middleware/authMiddleware");


const {
    createOrder
} = require(
    "../controllers/orderController"
);


/*
=========================================
CREATE ORDER
=========================================
*/

router.post(

    "/",

    authenticateToken,

    createOrder

);


module.exports =
    router;